import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, ChangeDetectorRef,
	OnChanges, SimpleChanges, ViewChild,
	ChangeDetectionStrategy
} from '@angular/core';
import { Observable, isObservable } from 'rxjs';
import _ from 'lodash';

import {
	CoerceBoolean, CoerceNumber, CoerceCssPixel,
	Unsubscriber, DefaultValue, untilCmpDestroyed
} from '@core';

import { WGCDialogService } from '../../wgc-dialog';
import { WGCMember, WGCIMember } from '../../wgc-member-picker';
import { WGCScrollBarComponent } from '../../wgc-scroll-bar';

import { ASSETS_ICON_SHADOW, ICON_TYPE } from '../resources';
import { WGCCommentBoxComponent } from '../wgc-comment-box/wgc-comment-box.component';
import { WGCDialogReactionComponent } from '../wgc-dialog-reaction/wgc-dialog-reaction.component';
import { WGCDialogCommentHistoryComponent } from '../wgc-dialog-comment-history/wgc-dialog-comment-history.component';

import {
	WGCIComment, WGCICommentCreateEvent, WGCICommentDeleteEvent,
	WGCICommentExtra, WGCICommentReaction, WGCICommentUpdateEvent,
	WGCIReactionUpdated, WGCICommentImageClickedEvent, WGCICommentContent,
	WGCIIconType, WGCIMention
} from '../interfaces';

@Unsubscriber()
@Component({
	selector		: 'wgc-comment-list',
	templateUrl		: './wgc-comment-list.pug',
	styleUrls		: [ './wgc-comment-list.scss' ],
	host			: { class: 'wgc-comment-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentListComponent implements OnChanges {

	@ViewChild( WGCCommentBoxComponent ) public wgcCommentBox: WGCCommentBoxComponent;
	@ViewChild( WGCScrollBarComponent ) public wgcScrollBar: WGCScrollBarComponent;

	@Input() @CoerceBoolean() public canComment: boolean;
	@Input() @CoerceNumber() public maxFilePerComment: number;
	@Input() @DefaultValue() @CoerceNumber() public limitReplies: number = 2;
	@Input() @CoerceCssPixel() public limitContentHeight: string;
	@Input() public comments: WGCICommentExtra[] = [];
	@Input() public userID: string;
	@Input() public user: WGCIComment[ 'user' ];
	@Input() public mentionSource: Function;
	@Input() public commentsHistory: Function;

	@Output() public commentCreated: EventEmitter<WGCICommentCreateEvent> = new EventEmitter<WGCICommentCreateEvent>();
	@Output() public commentUpdated: EventEmitter<WGCICommentUpdateEvent> = new EventEmitter<WGCICommentUpdateEvent>();
	@Output() public commentDeleted: EventEmitter<WGCICommentDeleteEvent> = new EventEmitter<WGCICommentDeleteEvent>();
	@Output() public commentsChange: EventEmitter<WGCIComment[]> = new EventEmitter<WGCIComment[]>();
	@Output() public commentsLoadMore: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() public repliesLoadMore: EventEmitter<WGCIComment> = new EventEmitter<WGCIComment>();
	@Output() public imageClicked: EventEmitter<WGCICommentImageClickedEvent> = new EventEmitter<WGCICommentImageClickedEvent>();
	@Output() public reactionUpdated: EventEmitter<WGCIReactionUpdated> = new EventEmitter<WGCIReactionUpdated>();

	public readonly MEMBER_STATUS: typeof WGCMember.MEMBER_STATUS = WGCMember.MEMBER_STATUS;
	public readonly ASSETS_ICON_SHADOW: typeof ASSETS_ICON_SHADOW = ASSETS_ICON_SHADOW;
	public readonly ICON_TYPE: typeof ICON_TYPE = ICON_TYPE;
	public readonly ICON_LIST: WGCIIconType[] = [
		ICON_TYPE.LIKE,
		ICON_TYPE.HEART,
		ICON_TYPE.HEART_EYES,
		ICON_TYPE.WOW,
		ICON_TYPE.LAUGH,
		ICON_TYPE.SAD,
		ICON_TYPE.ANGRY,
	];

	public editingComment: WGCICommentExtra;
	public replyingComment: WGCICommentExtra;
	public mentionedID: string;

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {WGCDialogService} _wgcDialogService
	 */
	constructor(
		private _cdRef: ChangeDetectorRef,
		private _wgcDialogService: WGCDialogService
	) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.comments && this._initSelectedMembers();
	}

	/**
	 * @param {WGCICommentContent} content
	 * @param {WGCIComment} replyingComment
	 * @return {void}
	 */
	public createComment( content: WGCICommentContent, replyingComment?: WGCIComment ) {
		const replyTo: WGCICommentExtra = replyingComment && _.find( this.comments, { id: replyingComment?.replyTo || replyingComment?.id } );
		const comment: WGCICommentExtra = {
			...content,
			id				: undefined,
			createdBy		: this.userID,
			replyTo			: replyTo ? replyTo.id : undefined,
			createdAt		: undefined,
			updatedAt		: undefined,
			user			: this.user,
			editable		: true,
			reactionCount	: 0,
			reactions		: [],
		};

		comment.highlight = true;

		if ( replyTo ) {
			replyTo.replies = _.arrayInsert( replyTo.replies, comment, 0 );
			replyTo.repliedUsers = [ this.user, ...( replyTo.repliedUsers || [] ) ];
			replyTo.repliedUserIDs = [ this.userID, ...( replyTo.repliedUserIDs || [] ) ];

			replyTo.totalReplies ? replyTo.totalReplies++ : replyTo.totalReplies = 1;

			this.cancelReplyState();

			this.commentCreated.emit({ comment, comments: replyTo.replies });
			return;
		}

		comment.totalReplies = 0;
		comment.replies = [];
		this.comments = _.arrayInsert( this.comments, comment, 0 );

		this.wgcScrollBar?.scrollToTop();
		this.commentCreated.emit({ comment, comments: this.comments });
	}

	/**
	 * @param {WGCICommentContent} newContent
	 * @return {void}
	 */
	public updateComment( newContent: WGCICommentContent ) {
		const oldContent: WGCICommentContent = _.pick( this.editingComment, _.keys( newContent ) );

		_.assign( this.editingComment, newContent );

		this.editingComment.isEdited = this.editingComment.isEdited || oldContent.content.html !== newContent.content.html;

		this.commentUpdated.emit({ oldContent, content: newContent, comment: this.editingComment });

		this.editingComment = undefined;
	}

	/**
	 * @param {WGCIComment} comment
	 * @return {void}
	 */
	public setEditComment( comment: WGCIComment ) {
		this.editingComment = comment;

		this._cdRef.detectChanges();
	}

	/**
	 * @param {WGCIComment[]} comments
	 * @param {WGCIComment} comment
	 * @return {void}
	 */
	public deleteComment( comments: WGCIComment[], comment: WGCIComment ) {
		this.commentDeleted.emit({ comments, comment });
	}

	/**
	 * @param {WGCIIconType} reactedType
	 * @param {WGCIComment} comment
	 * @return {void}
	 */
	public updateReaction( reactedType: WGCIIconType, comment: WGCICommentExtra ) {
		const userReactedType: WGCIIconType = _.clone( comment.userReactedType );
		const oldReaction: WGCICommentReaction = _.find( comment.reactions, { iconType: userReactedType } );
		const newReaction: WGCICommentReaction = _.find( comment.reactions, { iconType: reactedType } );

		oldReaction ? _.remove( oldReaction.users, { id: this.userID } ) : comment.reactionCount++;

		newReaction
			? newReaction.users = _.arrayInsert( newReaction.users, this.user , 0 )
			: comment.reactions = _.arrayInsert( comment.reactions, { users: [ this.user ], iconType: reactedType }, 0 );

		comment.userReactedType = reactedType;

		this.reactionUpdated.emit({ comment, userReactedType, reactedType });

		this._cdRef.markForCheck();
	}

	/**
	 * @param {WGCIComment} comment
	 * @param {WGCIIconType} iconType
	 * @return {void}
	 */
	public openDialogDetailReaction( comment: WGCIComment, iconType?: WGCIIconType ) {
		this._wgcDialogService
		.open(
			WGCDialogReactionComponent,
			{
				width		: '568px',
				minHeight	: '518px',
				data		: {
					comment,
					iconType,
					userID 			: this.userID,
					canComment		: this.canComment,
				},
			}
		)
		.afterClosed()
		.subscribe( ( result: WGCIReactionUpdated ) => {
			result && this.reactionUpdated.emit( result );

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @param {WGCIComment} comment
	 * @return {void}
	 */
	public openDialogEditHistory( comment: WGCIComment ) {
		const historyComments: Observable<WGCIComment[]> | WGCIComment[] = this.commentsHistory( comment );
		const limitContentHeight: string = this.limitContentHeight;

		this._wgcDialogService.open(
			WGCDialogCommentHistoryComponent,
			{
				data		: { historyComments, limitContentHeight },
				width		: '589px',
				minHeight	: '456px',
			}
		);
	}

	/**
	 * @param {WGCIReactionUpdated} event
	 * @return {void}
	 */
	public revertReactionUpdate( event: WGCIReactionUpdated ) {
		if ( !event ) return;

		const index: number = _.findIndex( this.comments, { id: event.comment.id } );
		const oldReaction: WGCICommentReaction = _.find( event.comment.reactions, { iconType: event.userReactedType } );
		const newReaction: WGCICommentReaction = _.find( event.comment.reactions, { iconType: event.reactedType } );

		newReaction && _.remove( newReaction.users, { id: this.userID } );
		oldReaction ? oldReaction.users.push( this.user ) : event.comment.reactionCount--;

		event.comment.userReactedType = event.userReactedType;

		this.comments[ index ] = event.comment;

		this._cdRef.markForCheck();
	}

	/**
	 * @param {WGCIComment} comment
	 * @return {void}
	 */
	public replyComment( comment: WGCIComment ) {
		const mentionSource: Observable<WGCIMention[]> | WGCIMention[] = this.mentionSource();
		const replyTo: WGCICommentExtra = _.find( this.comments, { id: comment?.replyTo || comment?.id } );

		replyTo.isHiddenReplies = true;

		this.replyingComment = _.clone( comment );

		// this.wgcCommentBox.wgcEditor.focus();

		if ( this.mentionedID === comment.id ) return;

		if ( _.isArray( mentionSource ) ) {
			const personMention: WGCIMention = _.find( mentionSource, { id: comment.user?.id } );

			personMention && this.wgcCommentBox.addMention( personMention );
		}

		if ( isObservable( mentionSource ) ) {
			mentionSource
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( ( data: WGCIMention[] ) => {
				const personMention: WGCIMention = _.find( data, { id: comment.user?.id } );

				personMention && this.wgcCommentBox.addMention( personMention );
			} );
		}

		this.mentionedID = comment.id;
	}

	/**
	 * @return {void}
	 */
	public cancelReplyState() {
		this.replyingComment = undefined;
		this.mentionedID = undefined;
	}

	/**
	 * @return {void}
	 */
	private _initSelectedMembers() {
		_.forEach( this.comments, ( comment: WGCICommentExtra ) => {
			comment.repliedUserIDs = _.map( comment.repliedUsers, ( user: WGCIMember ) => user?.id );
		} );
	}

}
