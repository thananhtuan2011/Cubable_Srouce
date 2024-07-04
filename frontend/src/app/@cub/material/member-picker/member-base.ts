import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	Observable,
	isObservable
} from 'rxjs';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	CoerceNumber,
	DefaultValue,
	untilCmpDestroyed
} from '@core';

import {
	COLOR
} from '@resources';

import {
	AvatarType
} from '../avatar';
import {
	CUBFormFieldInputDirective
} from '../form-field';
import {
	CUBMenuComponent,
	CUBMenuTriggerForDirective
} from '../menu';
import {
	CUBToastService
} from '../toast';

import {
	CUBMember,
	CUBTMember,
	CUBMemberData,
	TypeOfMember,
	MemberValue
} from './member/member';

@Directive()
export abstract class CUBMemberBase
implements OnChanges {

	@ViewChild( 'boxElm' )
	private _boxElm: ElementRef<any>;
	@ViewChild( 'multipleValueInput' )
	private _multipleValueInput: CUBFormFieldInputDirective;
	@ViewChild( 'pickerMenuTrigger' )
	public pickerMenuTrigger: CUBMenuTriggerForDirective;
	@ViewChild( 'pickerMenu' )
	protected pickerMenuComp: CUBMenuComponent;

	@Input() @DefaultValue() @CoerceBoolean()
	public strictDisplay: boolean = true;
	@Input() @CoerceBoolean()
	public disableClose: boolean;
	@Input() @DefaultValue() @CoerceNumber()
	public suggestionNumber: number = 6;
	@Input() @DefaultValue() @CoerceBoolean()
	public canMultipleSelect: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public autoReset: boolean;
	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public context: ObjectType;
	@Input() public placeholder: string;
	@Input() public keySearch: string;
	@Input() public values: MemberValue[];

	// option all
	@Input() public optionAll: CUBTMember;

	// members
	@Input() public users: CUBTMember[]
		| Observable<CUBTMember[]>
		| Function;
	@Input() public teams: CUBTMember[]
		| Observable<CUBTMember[]>
		| Function;

	// selected ids
	@Input() @CoerceBoolean()
	public selectedAllMembers: boolean;
	@Input() @CoerceArray()
	public selectedUserIDs: string[];
	@Input() @CoerceArray()
	public selectedTeamIDs: string[];

	// selected
	@Input() @CoerceArray()
	public selectedUsers: CUBTMember[];
	@Input() @CoerceArray()
	public selectedTeams: CUBTMember[];

	@Output() public keySearchChange: EventEmitter<string>
		= new EventEmitter<string>();

	@Output() public valuesChange: EventEmitter<MemberValue[]>
		= new EventEmitter<MemberValue[]>();

	@Output() public opened: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event>
		= new EventEmitter<Event>();

	// added
	@Output() public addedOptionAll: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public addedUsers: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public addedTeams: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public added: EventEmitter<CUBMemberData<CUBTMember[]>>
		= new EventEmitter<CUBMemberData<CUBTMember[]>>();

	// removed
	@Output() public removedOptionAll: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public removedUsers: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public removedTeams: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public removed: EventEmitter<CUBMemberData<CUBTMember[]>>
		= new EventEmitter<CUBMemberData<CUBTMember[]>>();

	// selected id
	@Output() public selectedAllMembersChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public selectedUserIDsChange: EventEmitter<string[]>
		= new EventEmitter<string[]>();
	@Output() public selectedTeamIDsChange: EventEmitter<string[]>
		= new EventEmitter<string[]>();
	@Output() public selectedChange: EventEmitter<CUBMemberData<String[]>>
		= new EventEmitter<CUBMemberData<String[]>>();

	// selected
	@Output() public selectedUsersChange: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public selectedTeamsChange: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public selectedMembersChange:
	EventEmitter<CUBMemberData<CUBTMember[]>>
		= new EventEmitter<CUBMemberData<CUBTMember[]>>();

	public onOptionAllRemoved: () => void;
	public onOptionAllAdded: () => void;
	public onUsersRemoved: ( members: CUBTMember[] ) => void;
	public onTeamsRemoved: ( members: CUBTMember[] ) => void;
	public onUsersAdded: ( members: CUBTMember[] ) => void;
	public onTeamsAdded: ( members: CUBTMember[] ) => void;

	protected readonly MEMBER_STATUS: typeof CUBMember.MEMBER_STATUS
		= CUBMember.MEMBER_STATUS;
	protected readonly TYPE_OF_MEMBER: typeof TypeOfMember = TypeOfMember;
	protected readonly AVATAR_TYPE: typeof AvatarType = AvatarType;
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	protected isChanged: boolean;
	protected focusing: boolean;
	protected isPickerMenuOpening: boolean;
	protected selectedIndex: number = 0;
	protected formControl: FormControl = new FormControl( undefined );
	protected selectedAllMembersClone: boolean;
	protected selectedMembers: CUBTMember[];
	protected selectedUsersClone: CUBTMember[];
	protected selectedTeamsClone: CUBTMember[];
	protected _users: CUBTMember[]; // use side template
	protected _teams: CUBTMember[]; // use side template
	protected bkSelectedUserIDs: string[];
	protected bkSelectedTeamIDs: string[];

	private readonly _cubToastService: CUBToastService
		= inject( CUBToastService );

	get availableTeams(): CUBTMember[] {
		return !this.strictDisplay
			? _.unionBy( this.selectedTeams, this._teams, 'id' )
			: this._teams;
	}
	get availableUsers(): CUBTMember[] {
		return !this.strictDisplay
			? _.unionBy( this.selectedUsers, this._users, 'id' )
			: this._users;
	}

	@HostListener( 'click', [ '$event' ] )
	public triggerClickInSite( event: Event ) {
		this._boxElm?.nativeElement.contains( event?.target )
			? this.focus()
			: this.focusing = false;

	}

	@HostListener( 'document:click', [ '$event' ] )
	public triggerClickOutSite( event: Event ) {
		if ( this._boxElm?.nativeElement.contains( event?.target ) ) return;

		this.focusing = false;
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 * @return {void}
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.optionAll?.currentValue ) {
			this.optionAll.avatar ||= {};
			this.optionAll.avatar.color ||= '#fdb022';
			this.optionAll.avatar.label ||= { text: 'ALL', color: COLOR.WHITE };
		}

		if (
			changes.disableClose?.currentValue
		) {
			this.pickerMenuComp?.ref?.disableClose();
		}
	}

	/**
	 * @param {KeyboardEvent} event
	 * @return {void}
	 */
	public triggerKeyDown( event: KeyboardEvent ) {
		const charCode: number = event.key.charCodeAt( 0 );

		switch ( charCode ) {
			// case 32: // Space
			// 	event.preventDefault();
			// 	break;
			case 66: // BackSpace
				if ( this.keySearch || !this.values?.length ) return;

				this.clearMember(
					this.values.length - 1, _.last( this.values )
				);
				break;
		}
	}

	/**
	 * @return {void}
	 */
	public onEsc() {
		this.keySearch = null;
		this.keySearchChange.emit( this.keySearch );

		this.focusing = false;
	}

	/**
	 * @return {void}
	 */
	public focus() {
		setTimeout( () => {
			this.focusing = true;

			setTimeout( () => this._multipleValueInput?.focus() );

			this.keySearch && this.search( this.keySearch );
			// this.pickerMenuTrigger?.updatePosition();
			this.cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	public setSelectedMembers() {
		if ( this.keySearch ) {
			const selectedUsers: CUBTMember[]
				= _.filter(
					this.availableUsers,
					( user: CUBTMember ) => {
						if ( !user.type ) user.type = this.TYPE_OF_MEMBER.USER;

						return _.includes( this.selectedUserIDs, user.id );
					}
				);
			const selectedTeams: CUBTMember[]
				= _.filter(
					this.availableTeams,
					( team: CUBTMember ) => {
						if ( !team.type ) team.type = this.TYPE_OF_MEMBER.TEAM;

						return _.includes( this.selectedTeamIDs, team.id );
					}
				);

			this.selectedMembers = _.filter(
				[
					...( this.optionAll && this.selectedAllMembers
						? [ this.optionAll ]
						: []
					),
					...selectedUsers,
					...selectedTeams,
				],
				( member: CUBTMember ) =>
					_.search( member.name, this.keySearch )
			);
		} else {
			this.selectedMembers = [];
		}
	}

	/**
	 * @return {void}
	 */
	protected done() {
		if ( !this.isChanged ) return;

		if ( this.required
			&& ( !this.selectedAllMembers
				|| !this.selectedUserIDs?.length
				|| !this.selectedTeamIDs?.length ) ) {
			this.selectedAllMembers = !this.selectedAllMembers;
			this.bkSelectedUserIDs = _.clone( this.bkSelectedUserIDs );
			this.selectedTeamIDs = _.clone( this.bkSelectedTeamIDs );
			this.selectedAllMembersClone = this.selectedAllMembers;
			this.selectedUsersClone = _.cloneDeep( this.selectedUsers );
			this.selectedTeamsClone = _.cloneDeep( this.selectedTeams );

			this._cubToastService.warning(
				'CUB.MESSAGE.AT_LEAST_ONE_MEMBER',
				{
					translate: { name: this.name || this.label },
				}
			);
			return;
		}

		this.isChanged = false;
		this.bkSelectedUserIDs = _.clone( this.selectedUserIDs );
		this.bkSelectedTeamIDs = _.clone( this.selectedTeamIDs );

		this.initSelectedUsers();
		this.initSelectedTeams();
		this.initSelectedAllMembers();
		// this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedUsersChange.emit( this.selectedUsers );
		this.selectedTeamsChange.emit( this.selectedTeams );
		this.selectedMembersChange.emit({
			users: this.selectedUsers,
			teams: this.selectedTeams,
		});
		// this.selectedChange.emit( this.selected );
		this.selectedAllMembersChange.emit( this.selectedAllMembers );
		this.selectedUserIDsChange.emit( this.selectedUserIDs );
		this.selectedTeamIDsChange.emit( this.selectedTeamIDs );
		this.selectedChange.emit({
			all: this.selectedAllMembers,
			users: this.selectedUserIDs,
			teams: this.selectedTeamIDs,
		});
	}

	/**
	 * @param {CUBTMember[] | Observable<CUBTMember[]> | Function} users
	 * @return {void}
	 */
	protected setUsers(
		users: CUBTMember[] | Observable<CUBTMember[]> | Function
	) {
		if ( isObservable( users ) ) return;

		if ( _.isFunction( users ) ) {
			this.loadUser( ( users as Function ).call( this ) );
			return;
		}

		this._users = users as CUBTMember[];

		this.initSelectedUsers();
	}

	/**
	 * @param {CUBTMember[] | Observable<CUBTMember[]> | Function} teams
	 * @return {void}
	 */
	protected setTeams(
		teams: CUBTMember[] | Observable<CUBTMember[]> | Function
	) {
		if ( isObservable( teams ) ) return;

		if ( _.isFunction( teams ) ) {
			this.loadTeam( ( teams as Function ).call( this ) );
			return;
		}

		this._teams = teams as CUBTMember[];

		this.initSelectedTeams();
	}

	/**
	 * @param {Observable<CUBTMember[]>} loader
	 * @return {void}
	 */
	protected loadUser( loader: Observable<CUBTMember[]> ) {
		if ( !loader ) return;

		// eslint-disable-next-line dot-notation, @typescript-eslint/dot-notation
		loader[ '_context' ] = this.context;

		this._users = [];

		loader
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( members: CUBTMember[] ) => {
			this._users = members;

			this.initSelectedUsers();
			this.cdRef.markForCheck();
		} );
	}

	/**
	 * @param {Observable<CUBTMember[]>} loader
	 * @return {void}
	 */
	protected loadTeam( loader: Observable<CUBTMember[]> ) {
		if ( !loader ) return;

		// eslint-disable-next-line dot-notation, @typescript-eslint/dot-notation
		loader[ '_context' ] = this.context;

		this._teams = [];

		loader
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( members: CUBTMember[] ) => {
			this._teams = members;

			this.initSelectedTeams();
			this.cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	protected initSelectedUsers() {
		const selectedUserIDsLookup: ObjectType<string>
			= _.keyBy( this.selectedUserIDs );

		this.selectedUsersClone = _.cloneDeep(
			this.selectedUsers = _.sortBy(
				_.filter(
					this.availableUsers,
					( user: CUBTMember ) =>
						!!user && _.has( selectedUserIDsLookup, user.id )
				),
				'cannotRemove'
			)
		);
	}

	/**
	 * @return {void}
	 */
	protected initSelectedTeams() {
		const selectedTeamIDsLookup: ObjectType<string>
			= _.keyBy( this.selectedTeamIDs );

		this.selectedTeamsClone = _.cloneDeep(
			this.selectedTeams = _.filter(
				this.availableTeams,
				( team: CUBTMember ) =>
					!!team && _.has( selectedTeamIDsLookup, team.id )
			)
		);
	}

	/**
	 * @param {boolean=} isInit
	 * @return {void}
	 */
	protected initSelectedAllMembers( isInit?: boolean ) {
		isInit
			? this.selectedAllMembersClone = this.selectedAllMembers
			: this.selectedAllMembers = this.selectedAllMembersClone
				|| this.selectedAllMembers;
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	public abstract search( event: string );

	/**
	 * @param {number} index
	 * @param {CUBTMember} member
	 * @return {void}
	 */
	public abstract clearMember( index: number, member: CUBTMember );

}
