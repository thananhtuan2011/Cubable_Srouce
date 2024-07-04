import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import {
	isObservable
} from 'rxjs';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber
} from '@core';

import {
	CUBTMember,
	CUBMember,
	TypeOfMember
} from '../member/member';
import {
	CUBMemberBase
} from '../member-base';

@Unsubscriber()
@Component({
	selector: 'cub-member-picker',
	templateUrl: './member-picker.pug',
	styleUrls: [ './member-picker.scss', '../styles/member-common.scss' ],
	host: { class: 'cub-member-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMemberPickerComponent
	extends CUBMemberBase
	implements OnChanges, AfterViewInit {

	@Input() @DefaultValue() @CoerceBoolean()
	public hasInput: boolean = true;

	public readonly MEMBER_STATUS: typeof CUBMember.MEMBER_STATUS
		= CUBMember.MEMBER_STATUS;

	public memberHovering: CUBTMember;
	public optionAllAvailableSelect: boolean;
	public usersAvailableSelect: CUBTMember[];
	public teamsAvailableSelect: CUBTMember[];
	public filteredMembers: CUBTMember[];
	public close: ( event?: Event ) => void;

	override ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if ( changes.users ) this.markAsUsersChanges();
		if ( changes.teams ) this.markAsTeamsChanges();

		if ( changes.selectedAllMembers ) {
			this.markAsSelectedAllMembersChanges();
		}
		if ( changes.selectedUserIDs ) {
			this.markAsSelectedUserIDsChanges();
		}
		if ( changes.selectedTeamIDs ) {
			this.markAsSelectedTeamIDsChanges();
		}
		if ( changes.selectedUsers ) {
			this.markAsSelectedUsersChanges();
		}
		if ( changes.selectedTeams ) {
			this.markAsSelectedTeamsChanges();
		}
		if ( changes.keySearch ) {
			this.search( this.keySearch );
		}

		if (
			changes.optionAll
			|| _.isBoolean( changes.selectedAllMembers?.currentValue )
		) {
			this._setOptionAllAvailableSelect();
		}
	}

	ngAfterViewInit() {
		if (
			this.disabled
			|| !this.autoFocusOn
		) return;

		this.actionOnMenuPicker(
			true
		);
	}

	/**
	 * @param {string}
	 * @return {void}
	 */
	public search( event: string ) {
		if ( this.hasInput ) {
			if ( this.keySearch === event && !event ) return;

			this.keySearch = event;

			this._search();

			return;
		}

		this._search();
	}

	/**
	 * @param {CUBTMember} member
	 * @param {TypeOfMember} type
	 * @return {void}
	 */
	public addMember(
		member: CUBTMember,
		type: TypeOfMember
	) {
		if ( this.disabled ) return;

		this.isChanged = true;

		if ( !this.values ) this.values = [];

		this.values.push({ ...member, type });
		this.valuesChange.emit( this.values );

		this.keySearch = null;
		this.keySearchChange.emit( this.keySearch );

		switch ( type ) {
			case TypeOfMember.ALL:
				this.selectedAllMembers = true;

				this._setOptionAllAvailableSelect();

				this.selectedAllMembersChange.emit( this.selectedAllMembers );
				this.addedOptionAll.emit();

				if ( _.isFunction( this.onOptionAllAdded ) ) {
					this.onOptionAllAdded();
				}
				break;
			case TypeOfMember.USER:
				if ( this.canMultipleSelect ) {
					this.selectedUserIDs
						= _.union( this.selectedUserIDs, [ member.id ] );

					if ( !_.find( this.selectedUsers, { id: member.id } ) ) {
						this.selectedUsers
							= _.arrayInsert( this.selectedUsers, member );
					}

					this._setUsersAvailableSelect();
					this._setTeamsAvailableSelect();
				} else {
					this.selectedUserIDs = [ member.id ];
					this.selectedUsers = [ member ];

					this._actionOnSingleSelect();
				}

				this.selectedUserIDsChange.emit( this.selectedUserIDs );
				this.selectedUsersChange.emit( this.selectedUsers );
				this.addedUsers.emit([ member ]);

				if ( _.isFunction( this.onUsersAdded ) ) {
					this.onUsersAdded([ member ]);
				}
				break;
			case TypeOfMember.TEAM:
				if ( this.canMultipleSelect ) {
					this.selectedTeamIDs
						= _.union( this.selectedTeamIDs, [ member.id ] );

					if (
						!_.find(
							this.selectedTeams,
							{ id: member.id }
						)
					) {
						this.selectedTeams
							= _.arrayInsert( this.selectedTeams, member );
					}

					this._setTeamsAvailableSelect();
				} else {
					this.selectedTeamIDs = [ member.id ];
					this.selectedTeams = [ member ];

					this._actionOnSingleSelect();
				}

				this.selectedTeamIDsChange.emit( this.selectedTeamIDs );
				this.selectedTeamsChange.emit( this.selectedTeams );
				this.addedTeams.emit([ member ]);

				if ( _.isFunction( this.onTeamsAdded ) ) {
					this.onTeamsAdded([ member ]);
				}
				break;
		}

		setTimeout( () => this.pickerMenuTrigger?.updatePosition() );
	}

	/**
	 * @param {number} index
	 * @param {CUBTMember} member
	 * @return {void}
	 */
	public clearMember( index: number, member: CUBTMember ) {
		setTimeout(() => {
			this.isChanged = true;

			this.values.splice( index, 1 );
			this.valuesChange.emit( this.values );

			switch ( member.type ) {
				case TypeOfMember.ALL:
					this.selectedAllMembers = false;

					this._setOptionAllAvailableSelect();

					this.selectedAllMembersChange.emit(
						this.selectedAllMembers
					);
					this.removedOptionAll.emit();

					if ( _.isFunction( this.onOptionAllRemoved ) ) {
						this.onOptionAllRemoved();
					}
					break;
				case TypeOfMember.USER:
					_.pull( this.selectedUserIDs, member.id );
					_.remove( this.selectedUsers, { id: member.id } );

					this._setUsersAvailableSelect();
					this._setTeamsAvailableSelect();

					this.selectedUserIDsChange.emit( this.selectedUserIDs );
					this.selectedUsersChange.emit( this.selectedUsers );
					this.removedUsers.emit([ member ]);

					if ( _.isFunction( this.onUsersRemoved ) ) {
						this.onUsersRemoved([ member ]);
					}
					break;
				case TypeOfMember.TEAM:
					_.pull( this.selectedTeamIDs, member.id );
					_.remove( this.selectedTeams, { id: member.id } );

					this._setTeamsAvailableSelect();

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
			this.actionOnMenuPicker();

			setTimeout( () => this.pickerMenuTrigger );
		});
	}

	/**
	 * @param {boolean=} focusInput
	 * @return {void}
	 */
	public actionOnMenuPicker(
		focusInput?: boolean
	) {
		setTimeout(
			() => {
				if (
					!this.pickerMenuTrigger
				) return;

				if ( this.isPickerMenuOpening ) {
					if (
						( !this.optionAll
							|| this.optionAll && this.selectedAllMembers )
						&& !this.usersAvailableSelect?.length
						&& !this.teamsAvailableSelect?.length
						&& !this.keySearch
						&& !this.selectedMembers?.length
					) {
						this.pickerMenuTrigger.close();

						this.isPickerMenuOpening = false;
					}
					return;
				}

				setTimeout(
					() => {
						if (
							this.pickerMenuTrigger.isOpened
						) return;

						this.pickerMenuTrigger.open();

						if ( focusInput ) {
							this.focus();
						}
					}, 50
				);
			}
		);
	}

	/**
	 * @return {void}
	 */
	public handleArrowUp() {
		const allEnabledOptions: CUBTMember[] = [
			...( this.optionAllAvailableSelect ? [ this.optionAll ] : [] ),
			...this.usersAvailableSelect,
			...this.teamsAvailableSelect,
		];

		if ( _.isStrictEmpty( allEnabledOptions ) ) return;

		if ( !this.memberHovering ) {
			this.memberHovering = _.last( allEnabledOptions );

			this.cdRef.markForCheck();
			return;
		};

		if ( this.memberHovering ) {
			let currentIndex: number
				= _.findIndex(
					allEnabledOptions,
					{ id: this.memberHovering.id }
				);

			if ( this.optionAllAvailableSelect
					&& currentIndex < 0 ) {
				currentIndex = 0;
			}

			this.memberHovering = ( currentIndex === 0 )
				? _.last( allEnabledOptions )
				: allEnabledOptions[ currentIndex - 1 ];
		}

		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public handleArrowDown() {
		const allEnabledOptions: CUBTMember[] = [
			...( this.optionAllAvailableSelect ? [ this.optionAll ] : [] ),
			...this.usersAvailableSelect,
			...this.teamsAvailableSelect,
		];

		if ( _.isStrictEmpty( allEnabledOptions ) ) return;

		if ( !this.memberHovering ) {
			this.memberHovering = _.head( allEnabledOptions );

			this.cdRef.markForCheck();
			return;
		};

		if ( this.memberHovering ) {
			let currentIndex: number
				= _.findIndex(
					allEnabledOptions,
					{ id: this.memberHovering.id }
				);

			if ( this.optionAll && currentIndex < 0 ) currentIndex = 0;

			this.memberHovering
				= ( currentIndex === allEnabledOptions.length - 1 )
					? _.head( allEnabledOptions )
					: allEnabledOptions[ currentIndex + 1 ];
		}

		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public handleEnter() {
		if ( !this.memberHovering ) return;

		switch ( true ) {
			case ( this.optionAll
					&& this.optionAll.id === this.memberHovering.id ):
				this.addMember( this.memberHovering, this.TYPE_OF_MEMBER.ALL );
				break;
			case ( this.usersAvailableSelect
				&& !!_.find(
					this.usersAvailableSelect,
					{ id: this.memberHovering.id }
				) ):
				this.addMember (this.memberHovering, this.TYPE_OF_MEMBER.USER );
				break;
			case ( this.teamsAvailableSelect
				&& !!_.find(
					this.teamsAvailableSelect,
					{ id: this.memberHovering.id }
				) ):
				this.addMember( this.memberHovering, this.TYPE_OF_MEMBER.TEAM );
				break;
		}
	}

	/**
	 * @return {void}
	 */
	public markAsKeySearchChanges() {
		this.search( this.keySearch );
	}

	/**
	 * @return {void}
	 */
	public markAsUsersChanges() {
		isObservable( this.users )
			? this.loadUser( this.users )
			: this.setUsers( this.users );
	}

	/**
	 * @return {void}
	 */
	public markAsTeamsChanges() {
		isObservable( this.teams )
			? this.loadTeam( this.teams )
			: this.setTeams( this.teams );
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedAllMembersChanges() {
		this.initSelectedAllMembers();
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedUserIDsChanges() {
		this.selectedUserIDs && this.initSelectedUsers();
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedTeamIDsChanges() {
		this.selectedTeamIDs && this.initSelectedTeams();
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedUsersChanges() {
		this.selectedUsers && this.initSelectedUsers();
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedTeamsChanges() {
		this.selectedTeams && this.initSelectedTeams();
	}

	/**
	 * @overloading
	 * @return {void}
	 */
	protected initSelectedAllMembers() {
		super.initSelectedAllMembers();
		this._setOptionAllAvailableSelect();
	}

	/**
	 * @overloading
	 * @return {void}
	 */
	protected initSelectedUsers() {
		super.initSelectedUsers();
		this._setUsersAvailableSelect();
	}

	/**
	 * @overloading
	 * @return {void}
	 */
	protected initSelectedTeams() {
		super.initSelectedTeams();
		this._setTeamsAvailableSelect();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	protected onPickerMenuOpened( event: Event ) {
		this.isPickerMenuOpening = true ;
		this.memberHovering = null;

		this.opened.emit( event );
	}

	/**
	 * @return {void}
	 */
	private _setOptionAllAvailableSelect() {
		this.optionAllAvailableSelect
			= !!this.optionAll && !this.selectedAllMembers;
	}

	/**
	 * @return {void}
	 */
	private _setUsersAvailableSelect() {
		let index: number = 0;

		this.usersAvailableSelect
			= _.filter(
				this._users,
				( user: CUBTMember ) => {
					if ( !_.includes( this.selectedUserIDs, user.id ) ) index++;

					user.type ||= this.TYPE_OF_MEMBER.USER;

					return index > this.suggestionNumber
						? false
						: !_.includes( this.selectedUserIDs, user.id );
				}
			);
	}

	/**
	 * @return {void}
	 */
	private _setTeamsAvailableSelect() {
		setTimeout(
			() => {
				const unselectedTeams: CUBTMember[]
					= _.filter(
						this._teams,
						( team: CUBTMember ) => {
							return !_.includes( this.selectedTeamIDs, team.id );
						}
					);

				const teams: CUBTMember[] = this.keySearch
					? unselectedTeams
					: _.take(
						unselectedTeams,
						this.usersAvailableSelect
							? this.suggestionNumber
								- this.usersAvailableSelect?.length
							: this.suggestionNumber
					);

				this.teamsAvailableSelect = _.map(
					teams,
					( team: CUBTMember ) => {
						team.type ||= this.TYPE_OF_MEMBER.TEAM;

						return team;
					}
				);

				this.cdRef.markForCheck();
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _search() {
		let index: number = 0;

		this.usersAvailableSelect
			= _.filter(
				this._users,
				( user: CUBTMember ) => {
					if ( _.search( user.name, this.keySearch )
						&& !_.includes( this.selectedUserIDs, user.id ) ) {
						index++;
					}

					return index > this.suggestionNumber
						? false
						: _.search( user.name, this.keySearch )
							&& !_.includes( this.selectedUserIDs, user.id );
				}
			);

		const teams: CUBTMember[] = this.keySearch
			? this._teams
			: _.take(
				this._teams,
				this.suggestionNumber - this.usersAvailableSelect?.length
			);

		this.teamsAvailableSelect = _.filter(
			teams,
			( team: CUBTMember ) => {
				return _.search( team.name, this.keySearch )
					&& !_.includes( this.selectedTeamIDs, team.id );
			}
		);

		this.optionAllAvailableSelect
			= !!this.optionAll
				&& !this.selectedAllMembers
				&& _.search( this.optionAll.name, this.keySearch );

		this.setSelectedMembers();
		this.actionOnMenuPicker();

		this.cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	private _actionOnSingleSelect() {
		this.keySearch = null;

		this.keySearchChange.emit( this.keySearch );

		this.close();
	}

}
