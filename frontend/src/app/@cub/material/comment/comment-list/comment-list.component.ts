import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	Output,
	OnChanges,
	ViewEncapsulation,
	inject,
	SimpleChanges
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	CoerceNumber
} from '@core';

import {
	CUBMember
} from '../../member-picker';

import {
	CUBComment,
	CUBCommentContent,
	CUBCommentCreateEvent,
	CUBCommentDeleteEvent,
	CUBCommentExtra,
	CUBCommentUpdateEvent
} from '../interfaces';

@Component({
	selector: 'cub-comment-list',
	templateUrl: './comment-list.pug',
	styleUrls: [ './comment-list.scss' ],
	host: { class: 'cub-comment-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCommentListComponent
implements OnChanges {

	@Input() @CoerceBoolean()
	public isBottomSticky: boolean;
	@Input() @CoerceBoolean()
	public isTopSticky: boolean;
	@Input() @CoerceBoolean()
	public canComment: boolean;
	@Input() @CoerceBoolean()
	public loadedAllComments: boolean;
	@Input() @CoerceNumber()
	public limitPerLoad: number;
	@Input() @CoerceNumber()
	public editorHeight: number;
	@Input() @CoerceNumber()
	public commentListHeight: number;
	@Input() @CoerceArray()
	public comments: CUBComment[];
	@Input() public boardID: ULID;
	@Input() public user: CUBComment[ 'user' ];
	@Input() public boardAvailableUsersFunc: Function;

	@Output() public commentsLoadMore: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public commentCreated: EventEmitter<CUBCommentCreateEvent>
		= new EventEmitter<CUBCommentCreateEvent>();
	@Output() public commentUpdated: EventEmitter<CUBCommentUpdateEvent>
		= new EventEmitter<CUBCommentUpdateEvent>();
	@Output() public commentDeleted: EventEmitter<CUBCommentDeleteEvent>
		= new EventEmitter<CUBCommentDeleteEvent>();
	@Output() public commentsChange: EventEmitter<CUBComment[]>
		= new EventEmitter<CUBComment[]>();
	@Output() public repliesLoadMore: EventEmitter<CUBComment>
		= new EventEmitter<CUBComment>();

	protected readonly MEMBER_STATUS: typeof CUBMember.MEMBER_STATUS
		= CUBMember.MEMBER_STATUS;

	protected commentListRowGap: number = 40;
	protected editingComment: CUBCommentExtra;
	protected replyingComment: CUBCommentExtra;
	protected replyOfComment: CUBCommentExtra;
	protected moreActionID: ULID;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.comments?.currentValue ) {
			_.forEach(
				this.comments,
				( comment: CUBComment ) => {
					if (
						comment.amount > comment.replies?.length
					) return;

					( comment as CUBCommentExtra ).isShowAllReplies
						= true;
				}
			);
		}
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @param {CUBComment[]} comments
	 * @return {void}
	 */
	public pushComments(
		comments: CUBComment[]
	) {
		this.comments.push( ...comments );

		_.forEach(
			comments,
			( comment: CUBComment ) => {
				if (
					comment.amount > comment.replies?.length
				) return;

				( comment as CUBCommentExtra ).isShowAllReplies
					= true;
			}
		);

		this.commentsChange.emit( this.comments );
	}

	/**
	 * @param {ULID} parentID
	 * @param {CUBCommentExtra[]} replies
	 * @return {void}
	 */
	public pushReplies(
		parentID: ULID,
		replies: CUBCommentExtra[]
	) {
		const parentComment: CUBComment
			= _.find(
				this.comments,
				{ id: parentID }
			) as CUBComment;

		if ( !parentComment ) return;

		parentComment.replies ||= [];

		parentComment.replies.push( ...replies );
	}

	/**
	 * @param {CUBCommentContent} content
	 * @param {CUBComment} replyingComment
	 * @return {void}
	 */
	protected createComment(
		content: CUBCommentContent,
		replyingComment?: CUBComment
	) {
		if ( replyingComment ) {
			const parentComment: CUBCommentExtra
				= replyingComment
					&& _.find(
						this.comments,
						{
							id: replyingComment?.parentID,
						}
					);

			const newComment: CUBComment = {
				...replyingComment,
				...content,
			};

			this.commentCreated.emit({
				comment: newComment,
				comments: parentComment.replies,
			});

			if (
				parentComment.isShowAllReplies
			) {
				parentComment.replies ||= [];

				parentComment.replies.unshift(
					newComment
				);
			}

			parentComment.amount
				= ( parentComment.amount || 0 ) + 1;

			this.cancelReply(
				parentComment
			);
			return;
		}

		const comment: CUBCommentExtra = {
			...content,
			createdBy: this.user.id,
			user: this.user,
			editable: true,
			isShowAllReplies: true,
		} as CUBCommentExtra;

		this.comments.unshift(
			comment
		);

		this.commentCreated.emit({
			comment,
			comments: this.comments,
		});
	}

	/**
	 * @param {CUBCommentContent} newContent
	 * @return {void}
	 */
	protected updateComment(
		newContent: CUBCommentContent,
		updatedComment: CUBComment
	) {
		const oldContent: CUBCommentContent
			= _.pick(
				updatedComment,
				_.keys( newContent )
			);

		_.assign( updatedComment, newContent );

		this.commentUpdated.emit({
			oldContent,
			content: newContent,
			comment: updatedComment,
		});

		this.editingComment = undefined;
	}

	/**
	 * @return {void}
	 */
	protected cancelEdit() {
		this.editingComment = undefined;

		this._cdRef.markForCheck();
	}

	/**
	 * @param {CUBComment} comment
	 * @return {void}
	 */
	protected setEditComment( comment: CUBComment ) {
		this.editingComment
			= _.cloneDeep( comment );

		this._cdRef.markForCheck();
	}

	/**
	 * @param {CUBComment[]} comments
	 * @param {CUBComment} comment
	 * @return {void}
	 */
	protected deleteComment(
		comments: CUBComment[],
		comment: CUBComment
	) {
		this.commentDeleted.emit({ comments, comment });
	}

	/**
	 * @param {CUBCommentExtra} comment
	 * @return {void}
	 */
	protected replyComment(
		parentComment: CUBCommentExtra,
		comment: CUBCommentExtra
	) {
		this._cancelOldReply();

		if ( parentComment ) {
			parentComment.isReplying
				= true;
		} else {
			comment.isReplying
				= true;
		}

		this.replyingComment
			= {
				createdBy: this.user.id,
				parentID: parentComment?.id || comment.id,
				user: this.user,
				editable: true,
			} as CUBCommentExtra;

		setTimeout(
			() =>
				this.replyOfComment
					= comment
		);
	}

	/**
	 * @param {CUBCommentExtra} comment
	 * @return {void}
	 */
	protected cancelReply(
		comment: CUBCommentExtra
	) {
		comment.isReplying = false;
		this.replyingComment = undefined;
	}

	/**
	 * @param {CUBCommentExtra} comment
	 * @return {void}
	 */
	protected showMoreReply(
		comment: CUBCommentExtra
	) {
		comment.isShowAllReplies = true;

		if ( comment.amount <= comment.replies?.length ) return;

		this.repliesLoadMore.emit( comment );
	}

	/**
	 * @return {void}
	 */
	protected _cancelOldReply( ) {
		if ( !this.replyingComment ) return;

		const replyingComment: CUBCommentExtra
			= _.find(
				this.comments,
				{ id: this.replyingComment.parentID }
			);

		this.cancelReply( replyingComment );
	}

}
