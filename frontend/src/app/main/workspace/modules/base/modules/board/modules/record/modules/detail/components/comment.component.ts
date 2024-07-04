import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	EventEmitter,
	inject
} from '@angular/core';
import {
	finalize
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	CUBComment,
	CUBCommentCreateEvent,
	CUBCommentDeleteEvent,
	CUBCommentUpdateEvent,
	CUBCommentListComponent
} from '@cub/material/comment';
import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	CommentCreate,
	CommentQuery,
	CommentService
} from '../services/comment.service';

@Unsubscriber()
@Component({
	selector: 'comment',
	templateUrl: '../templates/comment.pug',
	styleUrls: [ '../styles/comment.scss' ],
	host: { class: 'comment' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentComponent implements OnChanges {

	@ViewChild ( CUBCommentListComponent )
	public commentList: CUBCommentListComponent;

	@Input() @CoerceBoolean() public isTopSticky: boolean;
	@Input() @CoerceBoolean() public isBottomSticky: boolean;
	@Input() @CoerceBoolean() public hasCommentPermission: boolean;
	@Input() @CoerceNumber() public editorHeight: number;
	@Input() @CoerceNumber() public commentListHeight: number;
	@Input() public recordID: ULID;
	@Input() public boardID: ULID;
	@Input() public user: IUser;
	@Input() public users: IUser[];
	@Input() public userComment: CUBComment[ 'user' ];
	@Input() public boardAvailableUsersFunc: Function;

	@Output() public commentsLoaded: EventEmitter<void>
		= new EventEmitter<void>();

	protected limitPerLoad: number = 5;
	protected loaded: boolean;
	protected loadedAllReplies: boolean;
	protected loadedAllComments: boolean;
	protected comments: CUBComment[];

	private readonly _commentService: CommentService
		= inject( CommentService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.user?.currentValue ) {
			this.getComments();
		}
	}

	/**
	 * @param {boolean} isLoadMore
	 * @param {CUBComment} parentComment
	 * @return {void}
	 */
	protected getComments(
		isLoadMore?: boolean,
		parentComment?: CUBComment
	) {
		const params: CommentQuery = {
			limit: parentComment
				? parentComment.amount + 1
				: this.limitPerLoad,
			offset: isLoadMore
				? parentComment
					? parentComment.replies.length
					: this.comments.length
				: 0,
		};

		if ( !isLoadMore ) {
			this.loaded = false;
			this.comments = [];

			this._cdRef.markForCheck();
		}

		if ( parentComment ) {
			this._getReplies( params, parentComment );
		} else {
			this._getRootComments( params, isLoadMore );
		}
	}

	/**
	 * @param {CUBCommentCreateEvent} event
	 * @return {void}
	 */
	protected onCommentCreated(
		event: CUBCommentCreateEvent
	) {
		const data: CommentCreate = {
			...( _.pick(
				event.comment,
				'parentID',
				'message',
				'files',
				'linkPreviews',
				'mentions',
				'metadata'
			) ),
		};

		this._commentService
		.create( data, this.recordID, this.boardID )
		.pipe(
			finalize(
				() => this.commentList.markForCheck()
			),
			untilCmpDestroyed( this )
		).subscribe({
			next: ( result: CUBComment ) => {
				_.assign( event.comment, result );
			},
			error: () => {
				_.remove( event.comments, event.comment );

				if ( !event.comment.parentID ) return;

				const comment: CUBComment
					= _.find(
						this.comments,
						{ id: event.comment.parentID }
					);

				if ( comment ) comment.amount--;
			},
		});

	}

	/**
	 * @param {CUBCommentUpdateEvent} event
	 * @return {void}
	 */
	protected onCommentUpdated( event: CUBCommentUpdateEvent ) {
		this._commentService
		.update( event.comment.id, event.content, this.boardID )
		.pipe(
			finalize( () => {
				this.commentList.markForCheck();
			}),
			untilCmpDestroyed( this )
		).subscribe({
			next: () =>
				event.comment.updatedAt
					= moment().toString(),
			error:() =>
				_.assign( event.comment, event.oldContent ),
		});
	}

	/**
	 * @param {CUBCommentDeleteEvent} event
	 * @return {void}
	 */
	protected onCommentDeleted(
		event: CUBCommentDeleteEvent
	) {
		this._confirmService
		.open(
			'RECORD.DETAIL.MESSAGE.DELETE_COMMENT_CONFIRM',
			'RECORD.DETAIL.LABEL.DELETE_COMMENT',
			{
				warning: true,
				buttonApply: {
					text: 'RECORD.DETAIL.LABEL.DELETE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.comments
					= _.reject( this.comments, event.comment );

				this._cdRef.markForCheck();

				this._commentService
				.delete( event.comment.id )
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: () => {
						const comment: CUBComment
							= _.find(
								this.comments,
								{ id: event.comment.parentID }
							);

						if ( !comment ) return;

						comment.amount--;

						if (
							comment.replies.length < this.limitPerLoad
						) {
							this.getComments( true, comment );
						}

						_.remove(
							comment.replies,
							{ id: event.comment.id }
						);
					},
					error: () => {
						const sortedIndex: number
							= _.sortedIndexBy(
								event.comments,
								event.comment,
								( comment: CUBComment ) =>
									0 - +moment( comment.createdAt )
							);

						this.comments.splice(
							sortedIndex,
							0,
							event.comment
						);
					},
				});
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected loadMoreComments() {
		if ( !this.loaded ) return;

		this.getComments( true );
	}

	/**
	 * @param {CUBComment} comment
	 * @return {void}
	 */
	protected loadMoreReplies( comment: CUBComment ) {
		this.getComments( true, comment );
	}

	/**
	 * @param {CommentQuery} params
	 * @param {CUBComment} parentComment
	 * @return {void}
	 */
	private _getReplies(
		params: CommentQuery,
		parentComment?: CUBComment
	) {
		this._commentService
		.getReplies(
			params,
			parentComment.id
		)
		.pipe(
			finalize(
				() => {
					this.loaded = true;

					this._cdRef.markForCheck();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: CUBComment[] ) => {
				const replies: CUBComment[ 'replies' ]
					= _.map(
						result,
						( reply: CUBComment ): CUBComment => ({
							...reply,
							editable: this.hasCommentPermission
								&& reply.createdBy === this.user.id,
							user:
								_.find(
									this.users,
									{ id: reply.createdBy }
								),
						})
					);

				this.commentList.pushReplies(
					parentComment.id,
					replies
				);
				this.commentList.markForCheck();
			},
		});
	}

	/**
	 * @param {CommentQuery} params
	 * @param {boolean} isLoadMore
	 * @return {void}
	 */
	private _getRootComments(
		params: CommentQuery,
		isLoadMore?: boolean
	) {
		this._commentService
		.get( params, this.recordID )
		.pipe(
			finalize( () => {
				this.loaded = true;
				this._cdRef.markForCheck();

				setTimeout(
					() => this.commentsLoaded.emit()
				);
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: CUBComment[] ) => {
				const comments: CUBComment[]
					= _.map(
						result,
						( comment: CUBComment ): CUBComment => ({
							...comment,
							editable:
								this.hasCommentPermission
								&& comment.createdBy === this.user.id,
							replies:
								_.map(
									comment.replies,
									( reply: CUBComment ): CUBComment => ({
										...reply,
										editable: this.hasCommentPermission
											&& reply.createdBy === this.user.id,
										user:
											_.find(
												this.users,
												{ id: reply.createdBy }
											),
									})
								),
							user:
								_.find(
									this.users,
									{ id: comment.createdBy }
								),
						}) );

				this.loadedAllComments
					= comments.length < this.limitPerLoad;

				isLoadMore
					? this.commentList.pushComments( comments )
					: this.comments = comments;
			},
		});
	}

}
