import {
	Component, OnInit, Inject,
	ChangeDetectionStrategy, ViewChild
} from '@angular/core';
import _ from 'lodash';

import { Unsubscriber } from '@core';

import { WGCIDialogRef, WGC_DIALOG_DATA, WGC_DIALOG_REF } from '../../wgc-dialog';
import { WGCIMember } from '../../wgc-member-picker';
import { WGCSearchBoxComponent } from '../../wgc-search-box';

import { ASSETS_ICON } from '../resources';
import { WGCIComment, WGCICommentReaction, WGCIReactionUpdated, WGCIIconType } from '../interfaces';

interface WGCICommentExtra extends WGCIComment {
	userReactedType?: WGCIIconType;
}

@Unsubscriber()
@Component({
	selector		: 'wgc-dialog-reaction',
	templateUrl		: './wgc-dialog-reaction.pug',
	styleUrls		: [ './wgc-dialog-reaction.scss' ],
	host			: { class: 'wgc-dialog-reaction' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})

export class WGCDialogReactionComponent implements OnInit {

	@ViewChild( 'searchBox' ) public searchBox: WGCSearchBoxComponent;

	public readonly ASSETS_ICON: typeof ASSETS_ICON = ASSETS_ICON;

	public tabIndex: number;
	public reactions: WGCICommentReaction[];
	public reactionsClone: WGCICommentReaction[];
	public reactedDelete: WGCIReactionUpdated;

	/**
	 * @constructor
	 * @param {ObjectType} data
	 * @param {WGCIDialogRef} dialogRef
	 */
	constructor(
		@Inject( WGC_DIALOG_DATA ) public data: {
			comment: WGCIComment;
			iconType: WGCIIconType;
			userID: string;
			canComment: boolean;
		},
		@Inject( WGC_DIALOG_REF ) public dialogRef: WGCIDialogRef
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		const reactions: WGCICommentReaction[] = _.filter( this.data.comment?.reactions,
			( reaction: WGCICommentReaction ) => reaction.users?.length
		) as WGCICommentReaction[];

		this.dialogRef.onBeforeAutoClose = this._getDialogResult.bind( this );
		this.tabIndex = ( _.findIndex( reactions, { iconType: this.data?.iconType } ) ) + 1;
		this.reactions = _.cloneDeep( reactions );
		this.reactionsClone = _.cloneDeep( reactions );
		this.filterUserReactions();
	}

	/**
	 * @return {void}
	 */
	public filterUserReactions() {
		const _reactionsClone: WGCICommentReaction[] = _.cloneDeep( this.reactionsClone );
		const _reactions: WGCICommentReaction[] = this.tabIndex ? [ _reactionsClone[ this.tabIndex - 1 ] ] : _reactionsClone;

		if ( this.searchBox?.searchQuery ) {
			this.reactions = _.filter( _reactions, ( reaction: WGCICommentReaction ) => {
				reaction.users = _.filter( reaction.users, ( user: WGCIMember ) => _.search( user.name, this.searchBox.searchQuery ) );

				return reaction.users.length && reaction;
			} ) as WGCICommentReaction[];

			return;
		}

		this.reactions = _reactions;
	}

	/**
	 * @param {WGCIIconType} reactedType
	 * @param {WGCICommentExtra} comment
	 * @return {void}
	 */
	public deleteReaction( reactedType: WGCIIconType, comment: WGCICommentExtra ) {
		const userReactedType: WGCIIconType = _.clone( comment.userReactedType );
		const indexDeleted: number = _.findIndex( comment.reactions, { iconType: reactedType } );
		const indexReactions: number = _.findIndex( this.reactionsClone, { iconType: reactedType } );

		if ( !~indexDeleted ) return;

		_.remove( comment.reactions[ indexDeleted ].users, { id: this.data.userID } );
		_.remove( this.reactionsClone[ indexReactions ].users, { id: this.data.userID } );

		if ( !this.reactionsClone[ indexReactions ].users.length ) {
			this.tabIndex = 0;

			_.remove( this.reactionsClone, { iconType: reactedType } );
		}

		this.filterUserReactions();

		comment.userReactedType = undefined;
		comment.reactionCount--;

		this.reactedDelete = { comment, userReactedType, reactedType };
	}

	/**
	 * @return {WGCIReactionUpdated}
	 */
	private _getDialogResult(): WGCIReactionUpdated {
		return this.reactedDelete;
	}

}
