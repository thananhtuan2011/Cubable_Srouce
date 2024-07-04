import {
	Component, EventEmitter, Inject,
	InjectionToken, Input, OnChanges,
	Output, SimpleChanges, ViewChild,
	ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import moment from 'moment-timezone';
import _ from 'lodash';

import { Unsubscriber, untilCmpDestroyed } from '@core';

import {
	WGCCommentListComponent, WGCICommentCreateEvent, WGCICommentImageClickedEvent,
	WGCICommentDeleteEvent, WGCICommentUpdateEvent, WGCIReactionUpdated
} from '@wgc/wgc-comment';
import { WGCConfirmService } from '@wgc/wgc-confirm';
import { WGCIDialogRef } from '@wgc/wgc-dialog';

import { IUser } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import { IComment, IReaction } from '../interfaces';
import { CONSTANT } from '../resources';
import { ICommentQuery, ICommentCreate, ICommentService } from '../services';

export const COMMENT_SERVICE: InjectionToken<ICommentService> = new InjectionToken<ICommentService>( 'COMMENT_SERVICE' );

@Unsubscriber()
@Component({
	selector		: 'comment',
	templateUrl		: '../templates/comment.pug',
	styleUrls		: [ '../styles/comment.scss' ],
	host			: { class: 'comment' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CommentComponent implements OnChanges {

	@ViewChild( WGCCommentListComponent ) public wgcCommentList: WGCCommentListComponent;

	@Input() public canComment: boolean;
	@Input() public canEditComment: boolean;
	@Input() public refID: string;
	@Input() public user: IUser;
	@Input() public userComment: IComment[ 'user' ];
	@Input() public mentionSourceFn: Function;
	@Input() public dialogRef: WGCIDialogRef;

	@Output() public commentCountChanged: EventEmitter<number> = new EventEmitter<number>();
	@Output() public imageClicked: EventEmitter<WGCICommentImageClickedEvent> = new EventEmitter<WGCICommentImageClickedEvent>();

	// Template binding
	public commentsHistoryFn: typeof this.commentsHistory = this.commentsHistory.bind( this );

	public loaded: boolean;
	public loadedAllComment: boolean;
	public comments: IComment[];

	/**
	 * @constructor
	 * @param {ICommentService} _commentService
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {WGCConfirmService} _wgcConfirmService
	 */
	constructor(
		@Inject( COMMENT_SERVICE ) private _commentService: ICommentService,
		private _cdRef: ChangeDetectorRef,
		private _wgcConfirmService: WGCConfirmService
	) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.refID ) {
			this.loadedAllComment = false;

			this.getComments();
		}
	}

	/**
	 * @param {boolean} isLoadMore
	 * @param {IComment} replyTo
	 * @param {boolean} forceReload
	 * @return {void}
	 */
	public getComments( isLoadMore?: boolean, replyTo?: IComment, forceReload?: boolean ) {
		this.loaded = false;

		const params: ICommentQuery = {
			limit	: CONSTANT.DEFAULT_LIMIT_API,
			offset	: isLoadMore ? ( replyTo ? replyTo.replies.length : this.comments.length ) : 0,
		};

		if ( replyTo ) params.replyTo = replyTo.id;
		if ( !isLoadMore ) {
			this.comments = [];

			this._cdRef.markForCheck();
		}

		this._commentService
		.get( params, forceReload, this.refID )
		.pipe(
			finalize( () => {
				this.loaded = true;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( result: IComment[] ) => {
			if ( !replyTo ) {
				const comments: IComment[] = _.map( result, ( comment: IComment ): IComment => ({
					...comment,
					editable		: this.canEditComment && comment.createdBy === this.user.id,
					loadedAllReplies: comment.replies?.length === comment.totalReplies,
					replies: _.map( comment.replies, ( reply: IComment ): IComment => ({
						...reply, editable: this.canEditComment && reply.createdBy === this.user.id,
					}) ),
				}) );

				this.comments = isLoadMore ? [ ...this.comments, ...comments ] : comments;

				if ( result.length < CONSTANT.DEFAULT_LIMIT_API ) this.loadedAllComment = true;
				return;
			}

			const replies: IComment[ 'replies' ] = _.map( result, ( reply: IComment ): IComment => ({
				...reply, editable: this.canEditComment && reply.createdBy === this.user.id,
			}) );

			replyTo.replies.push( ...replies );

			if ( replyTo.replies?.length === replyTo.totalReplies ) replyTo.loadedAllReplies = true;
		} );
	}

	/**
	 * @param {WGCICommentCreateEvent} event
	 * @return {void}
	 */
	public onCommentCreated( event: WGCICommentCreateEvent ) {
		this._freeze();

		const mentionAll: boolean = !!_.remove( event.comment.mentions, ( id: string ) => id === CONSTANT.MENTION_ALL_ID ).length;
		const data: ICommentCreate = {
			...( _.omit( event.comment, 'createdBy', 'editable', 'createdAt', 'updatedAt', 'user', 'totalReplies', 'replies' ) ),
		};

		this._commentService
		.create( data, mentionAll, this.refID )
		.pipe(
			finalize( () => this._unfreeze() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IComment ) => {
				_.assign( event.comment, result );

				if ( event.comment.replyTo ) return;

				this.commentCountChanged.emit( 1 );
			},
			error: () => {
				_.remove( event.comments, event.comment );

				if ( !event.comment.replyTo ) return;

				const comment: IComment = _.find( this.comments, { id: event.comment.replyTo } );

				if ( comment ) comment.totalReplies--;
			},
		});
	}

	/**
	 * @param {WGCICommentUpdateEvent} event
	 * @return {void}
	 */
	public onCommentUpdated( event: WGCICommentUpdateEvent ) {
		this._freeze();

		const mentionAll: boolean = !!_.remove( event.comment.mentions, ( id: string ) => id === CONSTANT.MENTION_ALL_ID ).length
			&& !_.find( event.oldContent.content?.content?.ops, ( op: ObjectType ) => op.insert?.mention?.id === CONSTANT.MENTION_ALL_ID );

		this._commentService
		.update( event.comment.id, event.content, mentionAll )
		.pipe(
			finalize( () => this._unfreeze() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: Partial<IComment> ) => _.assign( event.comment, result ),
			error: () => _.assign( event.comment, event.oldContent ),
		});
	}

	/**
	 * @param {WGCICommentDeleteEvent} event
	 * @return {void}
	 */
	public onCommentDeleted( event: WGCICommentDeleteEvent ) {
		this._wgcConfirmService
		.open( 'COMMENT.MESSAGE.DELETE_COMMENT_CONFIRM', undefined, { warning: true } )
		.afterClosed()
		.subscribe( ( answer: boolean ) => {
			if ( !answer ) return;

			this._freeze();

			this.comments = _.reject( this.comments, event.comment ) as IComment[];

			this._cdRef.markForCheck();

			this._commentService
			.delete( event.comment.id )
			.pipe(
				finalize( () => this._unfreeze() ),
				untilCmpDestroyed( this )
			)
			.subscribe({
				next: () => {
					if ( !event.comment.replyTo ) {
						this.commentCountChanged.emit( -1 );
						return;
					}

					const comment: IComment = _.find( this.comments, { id: event.comment.replyTo } );

					if ( !comment ) return;

					comment.totalReplies--;
					comment.replies.length < CONSTANT.LIMIT_SHOW_REPLIES && !comment.loadedAllReplies && this.getComments( true, comment );

					_.remove( comment.replies, { id: event.comment.id } );
				},
				error: () => {
					const sortedIndex: number = _.sortedIndexBy( event.comments, event.comment, ( comment: IComment ) =>
						0 - +moment( comment.createdAt )
					);

					this.comments.splice( sortedIndex, 0, event.comment );
				},
			});
		} );
	}

	/**
	 * @param {WGCIReactionUpdated} event
	 * @return {void}
	 */
	public onReactionUpdated( event: WGCIReactionUpdated ) {
		this._freeze();

		this._commentService
		.react( event.comment.id, event.reactedType )
		.pipe(
			finalize( () => this._unfreeze() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IReaction ) => {
				event.comment.reactions = result.reactions;
				event.comment.reactionCount = result.reactionCount;
			},
			error: () => this.wgcCommentList.revertReactionUpdate( event ),
		});
	}

	/**
	 * @return {void}
	 */
	public loadMoreComments() {
		this.loaded && !this.loadedAllComment && this.getComments( true );
	}

	/**
	 * @param {IComment} comment
	 * @return {void}
	 */
	public loadMoreReplies( comment: IComment ) {
		this.getComments( true, comment );
	}

	/**
	 * @param {IComment} event
	 * @return {void}
	 */
	public commentsHistory( event: IComment ) {
		return this._commentService.history( event.id );
	}

	/**
	 * @return {void}
	 */
	private _freeze() {
		this.dialogRef?.freeze();
		this.dialogRef?.disablePager();
	}

	/**
	 * @return {void}
	 */
	private _unfreeze() {
		this.dialogRef?.unfreeze();
		this.dialogRef?.enablePager();
	}

}
