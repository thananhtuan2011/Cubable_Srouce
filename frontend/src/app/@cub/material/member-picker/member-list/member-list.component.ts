import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	HorizontalConnectionPos,
	VerticalConnectionPos
} from '@angular/cdk/overlay';
import {
	isObservable
} from 'rxjs';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceCssPixel,
	CoerceNumber,
	DefaultValue,
	Unsubscriber
} from '@core';

import {
	CUBAvatarSize
} from '../../avatar';
import {
	CUBConfirmService
} from '../../confirm';
import {
	CUBMenuComponent
} from '../../menu';
import {
	CUBOverlayPosition
} from '../../overlay';

import {
	CUBMemberBase
} from '../member-base';
import {
	CUBMemberRemovingConfig,
	CUBTMember,
	MemberValue,
	TypeOfMember
} from '../member/member';
import {
	CUBMemberPickerComponent
} from '../member-picker/member-picker.component';

export type CUBButtonAddSize = 'large' | 'medium' | 'small';

@Unsubscriber()
@Component({
	selector: 'cub-member-list',
	templateUrl: './member-list.pug',
	styleUrls: [ './member-list.scss', '../styles/member-common.scss' ],
	host: { class: 'cub-member-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMemberListComponent
	extends CUBMemberBase
	implements OnChanges {

	@HostBinding( 'class.cub-member-list--active' )
	get classActive(): boolean {
		return this.isOpened
			|| !this.selectedUsers?.length
			|| !this.selectedTeams?.length
			|| !this.toggleAddButton;
	};

	@HostBinding( 'class.cub-member-list__btn-add--small' )
	get classSmall(): boolean { return this.size === 'small'; }

	@HostBinding( 'class.cub-member-list__btn-add--medium' )
	get classMedium(): boolean { return this.size === 'medium'; }

	@HostBinding( 'class.cub-member-list__btn-add--large' )
	get classLarge(): boolean { return this.size === 'large'; }

	@ViewChild( 'pickerMenu' )
	public pickerMenu: CUBMenuComponent;
	@ViewChild( CUBMemberPickerComponent )
	public memberPickerComp: CUBMemberPickerComponent;

	@Input() @DefaultValue()
	public position: CUBOverlayPosition = 'below';
	@Input() @DefaultValue()
	public originX: HorizontalConnectionPos = 'start';
	@Input() public originY: VerticalConnectionPos;
	@Input() @DefaultValue()
	public overlayX: HorizontalConnectionPos = 'center';
	@Input() public overlayY: VerticalConnectionPos;
	@Input() @DefaultValue() @CoerceCssPixel()
	public size: string | CUBButtonAddSize = 'small';
	@Input() @CoerceCssPixel()
	public avatarSize: string | CUBAvatarSize;
	@Input() @DefaultValue() @CoerceNumber()
	public limit: number = 4;
	@Input() @DefaultValue() @CoerceBoolean()
	public hasFooter: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean()
	public canAdd: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean()
	public canRemove: boolean = true;
	@Input() @CoerceBoolean()
	public toggleAddButton: boolean;
	@Input() @CoerceBoolean()
	public autoOpen: boolean;
	@Input() @CoerceCssPixel()
	public width: string;
	@Input() public pickerTitle: string;
	@Input() public viewListTitle: string;
	@Input() public confirmRemovingConfig: CUBMemberRemovingConfig;
	@Input() public buttonDiscardTitle: string;
	@Input() public buttonApplyTitle: string;

	public readonly elementRef: ElementRef
		= inject( ElementRef );

	public isOpened: boolean;

	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _addOptionAll: boolean;
	private _addedUsers: CUBTMember[];
	private _addedTeams: CUBTMember[];
	private _removedOptionAll: boolean;
	private _removedUsers: CUBTMember[];
	private _removedTeams: CUBTMember[];

	override ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if ( changes.users ) this.setUsers( this.users );
		if ( changes.teams ) this.setTeams( this.teams );

		if ( changes.selectedUserIDs || changes.selectedUsers ) {
			this.initSelectedUsers();
		}
		if ( changes.selectedTeamIDs || changes.selectedTeams ) {
			this.initSelectedTeams();
		}
		if ( changes.selectedAllMembers ) this.initSelectedAllMembers( true );

		if ( changes.selectedUserIDs ) {
			this.bkSelectedUserIDs = _.clone( this.selectedUserIDs );
		}
		if ( changes.selectedTeamIDs ) {
			this.bkSelectedTeamIDs = _.clone( this.selectedTeamIDs );
		}
	}

	/**
	 * @return {void}
	 */
	public onMoreMenuOpened() {
		this._removedUsers
			= this._removedTeams
			= undefined;
		this._removedOptionAll = false;
	}

	/**
	 * @return {void}
	 */
	public onMoreMenuClosed() {
		this.selectedIndex = 0;

		if (
			!this._removedUsers?.length
			&& !this._removedTeams?.length
			&& !this._removedOptionAll
		) return;

		this.removedOptionAll.emit();
		this.removedUsers.emit( this._removedUsers );
		this.removedTeams.emit( this._removedTeams );
		this.removed.emit({
			all: this._removedOptionAll,
			users: this._removedUsers,
			teams: this._removedTeams,
		});

		this.done();
	}

	/**
	 * @return {void}
	 */
	public onPickerOpened() {
		if ( isObservable( this.users ) ) {
			this.loadUser( this.users );
		}
		if ( isObservable( this.teams ) ) {
			this.loadTeam( this.teams );
		}
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onPickerMenuOpened( event: Event ) {
		this.isOpened = true;
		this.focus();

		this.opened.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onPickerMenuClosed( event: Event ) {
		!this.hasFooter && this.onSave();

		this.values = [];
		this._addedUsers = [];
		this._addedTeams = [];
		this.keySearch = '';
		this.isOpened = false;

		this.closed.emit( event );
	}

	/**
	 * @return {void}
	 */
	public onAddedOptionAll() {
		this._addOptionAll = true;
	}

	/**
	 * @param {CUBTMember[]} users
	 * @return {void}
	 */
	public onAddedUsers( users: CUBTMember[] ) {
		this._addedUsers ||= [];

		if ( this.canMultipleSelect ) {
			this._addedUsers.push( ...users );
		} else {
			this._addedUsers = users;

			this.onSave();
		}
	}

	/**
	 * @param {CUBTMember[]} teams
	 * @return {void}
	 */
	public onAddedTeams( teams: CUBTMember[] ) {
		this._addedTeams ||= [];

		if ( this.canMultipleSelect ) {
			this._addedTeams.push( ...teams );
		} else {
			this._addedTeams = teams;

			this.onSave();
		}
	}

	/**
	 * @return {void}
	 */
	public onRemovedOptionAll() {
		this._addOptionAll = false;
	}

	/**
	 * @param {CUBTMember[]} users
	 * @return {void}
	 */
	public onRemovedUsers( users: CUBTMember[] ) {
		_.remove( this._addedUsers, { id: users[ 0 ].id } );
	}

	/**
	 *
	 * @param {CUBTMember[]} teams
	 * @return {void}
	 */
	public onRemovedTeams( teams: CUBTMember[] ) {
		_.remove( this._addedTeams, { id: teams[ 0 ].id } );
	}

	/**
	 * @return {void}
	 */
	public onCancel() {
		this.pickerMenu.close();
	}

	/**
	 * @return {void}
	 */
	public handleArrowUp() {
		this.memberPickerComp.handleArrowUp();
	}

	/**
	 * @return {void}
	 */
	public handleArrowDown() {
		this.memberPickerComp.handleArrowDown();
	}

	/**
	 * @return {void}
	 */
	public handleEnter() {
		this.memberPickerComp.handleEnter();
	}

	/**
	 * @override
	 * @param {string}
	 * @return {void}
	 */
	public search( event: string ) {
		if ( this.keySearch === event ) return;

		this.keySearch = event;
	}

	/**
	 * @param {number} index
	 * @param {MemberValue} member
	 * @return {void}
	 */
	public clearMember(
		index: number,
		member: MemberValue
	) {
		setTimeout(() => {
			this.isChanged = true;

			this.values.splice( index, 1 );
			this.valuesChange.emit( this.values );

			switch ( member.type ) {
				case TypeOfMember.ALL:
					this.selectedAllMembers = null;

					this.cdRef.detectChanges();

					this.selectedAllMembers = false;

					this.cdRef.detectChanges();

					this.selectedAllMembersChange.emit(
						this.selectedAllMembers
					);
					this.removedOptionAll.emit();

					if ( _.isFunction( this.onOptionAllRemoved ) ) {
						this.onOptionAllRemoved();
					}
					break;
				case TypeOfMember.USER:
					this.selectedUserIDs
						= _.without( this.selectedUserIDs, member.id );

					_.remove( this.selectedUsers, { id: member.id } );
					_.remove( this._addedUsers, { id: member.id } );

					this.selectedUserIDsChange.emit( this.selectedUserIDs );
					this.selectedUsersChange.emit( this.selectedUsers );
					this.removedUsers.emit([ member ]);

					if ( _.isFunction( this.onUsersRemoved ) ) {
						this.onUsersRemoved([ member ]);
					}
					break;
				case TypeOfMember.TEAM:
					this.selectedTeamIDs
						= _.without( this.selectedTeamIDs, member.id );

					_.remove( this.selectedTeams, { id: member.id } );
					_.remove( this._addedTeams, { id: member.id } );

					this.selectedTeamIDsChange.emit( this.selectedTeamIDs );
					this.selectedTeamsChange.emit( this.selectedTeams );
					this.removedTeams.emit([ member ]);

					if ( _.isFunction( this.onTeamsRemoved ) ) {
						this.onTeamsRemoved([ member ]);
					}
					break;
			}

			this.cdRef.markForCheck();

			this.setSelectedMembers();

			// setTimeout( () => this.pickerMenuTrigger );
		});
	}

	/**
	 * @param {CUBTMember} member
	 * @param {TypeOfMember} type
	 * @return {void}
	 */
	public removeMember(
		member: CUBTMember,
		type: TypeOfMember
	) {
		let messageConfirm: string;
		let typeMemberName: string;

		switch ( type ) {
			case TypeOfMember.ALL:
				messageConfirm = 'REMOVE_ALL_CONFIRM';
				typeMemberName = this._translateService.instant( 'CUB.LABEL.GROUP' );
				break;
			case TypeOfMember.USER:
				messageConfirm = 'REMOVE_USER_CONFIRM';
				typeMemberName = this._translateService.instant( 'CUB.LABEL.USER' );
				break;
			case TypeOfMember.TEAM:
				messageConfirm = 'REMOVE_TEAM_CONFIRM';
				typeMemberName = this._translateService.instant( 'CUB.LABEL.TEAM' );
				break;
		}

		this._cubConfirmService
		.open(
			this.confirmRemovingConfig?.confirmTitle
				|| `CUB.MESSAGE.${messageConfirm}`,
			this.confirmRemovingConfig?.title
				|| 'CUB.LABEL.REMOVE',
			{
				warning: true,
				buttonDiscard: this.buttonDiscardTitle || 'CUB.LABEL.CANCEL',
				translate: {
					userName: member.name,
					...this.confirmRemovingConfig?.translateParams,
					typeMemberName,
				},
				buttonApply: {
					text: this.buttonApplyTitle || 'CUB.LABEL.YES_REMOVE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.isChanged = true;

				switch ( type ) {
					case TypeOfMember.ALL:
						this.selectedAllMembersClone = false;
						this._removedOptionAll = true;
						break;
					case TypeOfMember.USER:
						this.selectedUserIDs
							= _.without( this.selectedUserIDs, member.id );
						this._removedUsers
							= _.arrayInsert( this._removedUsers, member );

						_.remove( this.selectedUsersClone, member );
						break;
					case TypeOfMember.TEAM:
						this.selectedTeamIDs
							= _.without( this.selectedTeamIDs, member.id );
						this._removedTeams
							= _.arrayInsert( this._removedTeams, member );

						_.remove( this.selectedTeamsClone, member );
						break;
				}

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	public onSave() {
		if ( this._addOptionAll
			|| this._addedUsers?.length
			|| this._addedTeams?.length ) {
			if ( this._addOptionAll ) {
				this.addedOptionAll.emit();
			}
			if ( this._addedUsers?.length ) {
				this.addedUsers.emit( this._addedUsers );
			}
			if ( this._addedTeams?.length ) {
				this.addedTeams.emit( this._addedTeams );
			}

			this.added.emit({
				all: this._addOptionAll,
				users: this._addedUsers,
				teams: this._addedTeams,
			});

			// TODO set this.selectedTeamIDs when return
			this.selectedAllMembersChange.emit( this.selectedAllMembers );
			this.selectedUserIDsChange.emit( this.selectedUserIDs );
			this.selectedTeamIDsChange.emit( this.selectedTeamIDs );
			this.selectedChange.emit({
				all: this.selectedAllMembers,
				users: this.selectedUserIDs,
				teams: this.selectedTeamIDs,
			});

			this.selectedUsersChange.emit( this.selectedUsers );
			this.selectedTeamsChange.emit( this.selectedTeams );
			this.selectedMembersChange.emit({
				users: this.selectedUsers,
				teams: this.selectedTeams,
			});
		}

		this.hasFooter && this.onCancel();
	}

	/**
	 * @param {MemberValue} members
	 * @return {void}
	 */
	protected onValuesChanged(
		members: MemberValue[]
	) {
		if ( members?.length > this.values?.length ) {
			this.focus();
		}

		this.values = members;

		this.valuesChange.emit( members );
	}

}
