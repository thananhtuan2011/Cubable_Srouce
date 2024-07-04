import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	inject
} from '@angular/core';
import {
	Observable
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	CoerceNumber,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBMenuRef,
	CUBMenuService,
	CUBMenuType
} from '../../menu';

import {
	CUBTMember,
	CUBMemberData,
	MemberValue
} from '../member/member';

import {
	CUBMemberPickerComponent
} from './member-picker.component';

@Unsubscriber()
@Directive({
	selector: '[cubMemberPicker]',
	exportAs: 'cubMemberPicker',
})
export class CUBMemberPickerDirective
implements OnChanges {

	@Input() @DefaultValue() @CoerceBoolean()
	public strictDisplay: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean()
	public canMultipleSelect: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean()
	public hasInput: boolean = true;
	@Input() @DefaultValue() @CoerceNumber()
	public suggestionNumber: number = 6;
	@Input() @DefaultValue() @CoerceBoolean()
	public trim: boolean = true;
	@Input() @CoerceBoolean()
	public autoReset: boolean;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public autoOpen: boolean;
	@Input() @CoerceBoolean()
	public required: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() @CoerceBoolean()
	public disableClose: boolean;
	@Input() public keySearch: string;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public placeholder: string;
	@Input() public context: ObjectType;
	@Input() public values: MemberValue[];

	@Input() @CoerceBoolean()
	public selectedAllMembers: boolean;
	@Input() @CoerceArray()
	public selectedUserIDs: ULID[];
	@Input() @CoerceArray()
	public selectedTeamIDs: ULID[];

	@Input() @CoerceArray()
	public selectedUsers: CUBTMember[];
	@Input() @CoerceArray()
	public selectedTeams: CUBTMember[];

	@Input() public optionAll: CUBTMember;
	@Input() public users: CUBTMember[]
		| Observable<CUBTMember[]>
		| Function;
	@Input() public teams: CUBTMember[]
		| Observable<CUBTMember[]>
		| Function;

	@Output() public keySearchChange: EventEmitter<string>
		= new EventEmitter<string>();

	@Output() public opened: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public backdropPress: EventEmitter<MouseEvent>
		= new EventEmitter<MouseEvent>();

	//added
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

	@Output() public selectedAllMembersChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public selectedUserIDsChange: EventEmitter<string[]>
		= new EventEmitter<string[]>();
	@Output() public selectedTeamIDsChange: EventEmitter<string[]>
		= new EventEmitter<string[]>();
	@Output() public selectedChange: EventEmitter<CUBMemberData<String[]>>
		= new EventEmitter<CUBMemberData<String[]>>();

	@Output() public selectedUsersChange: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public selectedTeamsChange: EventEmitter<CUBTMember[]>
		= new EventEmitter<CUBTMember[]>();
	@Output() public selectedMembersChange: EventEmitter<
		CUBMemberData<CUBTMember[]>
	>
		= new EventEmitter<CUBMemberData<CUBTMember[]>>();

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	private _menuRef: CUBMenuRef<CUBMemberPickerComponent>;
	private _instance: CUBMemberPickerComponent;

	get isOpened(): boolean {
		return !!this._menuRef?.isOpened;
	}

	ngOnChanges( changes: SimpleChanges ) {
		changes.autoOpen && this.autoOpen && this.open();

		if ( changes.optionAll?.currentValue ) {
			this.optionAll.avatar ||= {};
			this.optionAll.avatar.color ||= '#fdb022';
		}

		if ( !this._instance ) return;

		if ( changes.keySearch ) {
			this._instance.keySearch = this.keySearch;

			this._instance.markAsKeySearchChanges();
		}

		if ( changes.optionAll ) {
			this._instance.optionAll = this.optionAll;
		}

		if ( changes.users ) {
			this._instance.users = this.users;

			this._instance.markAsUsersChanges();
		}

		if ( changes.teams ) {
			this._instance.teams = this.teams;

			this._instance.markAsTeamsChanges();
		}

		if ( changes.selectedAllMembers ) {
			this._instance.selectedAllMembers = this.selectedAllMembers;
		}

		if ( changes.selectedUserIDs ) {
			this._instance.selectedUserIDs = this.selectedUserIDs;

			this._instance.markAsSelectedUserIDsChanges();
		}

		if ( changes.selectedTeamIDs ) {
			this._instance.selectedTeamIDs = this.selectedTeamIDs;

			this._instance.markAsSelectedTeamIDsChanges();
		}

		if ( changes.selectedUsers ) {
			this._instance.selectedUsers = this.selectedUsers;

			this._instance.markAsSelectedUsersChanges();
		}

		if ( changes.selectedTeams ) {
			this._instance.selectedTeams = this.selectedTeams;

			this._instance.markAsSelectedTeamsChanges();
		}

		if ( changes.required ) this._instance.required = this.required;
	}

	// tslint:disable-next-line:jsdoc-require
	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'contextmenu', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerClick( event: Event ) {
		if (
			this.readonly
			|| this.disabled
			|| this.isOpened
		) return;

		event.stopPropagation();
		event.preventDefault();
		this.open( event );
	}

	// ngOnDestroy() {
	// 	this._overlayRef?.dispose();
	// }

	/**
	 * @return {void}
	 */
	public onOptionAllAdded() {
		this.addedOptionAll.emit();
	}

	/**
	 * @param {CUBTMember[]} members
	 * @return {void}
	 */
	public onUsersAdded( members: CUBTMember[] ) {
		this.addedUsers.emit( members );
	}

	/**
	 * @param {CUBTMember[]} members
	 * @return {void}
	 */
	public onTeamsAdded( members: CUBTMember[] ) {
		this.addedTeams.emit( members );
	}

	/**
	 * @param {boolean} optionAll
	 * @param {CUBTMember[]} users
	 * @param {CUBTMember[]} teams
	 * @return {void}
	 */
	public onMembersAdded(
		optionAll: boolean,
		users: CUBTMember[],
		teams: CUBTMember[]
	) {
		this.added.emit({
			users,
			teams,
			all: optionAll,
		});
	}

	/**
	 * @return {void}
	 */
	public onOptionAllRemoved() {
		this.removedOptionAll.emit();
	}

	/**
	 * @param {CUBTMember[][]} members
	 * @return {void}
	 */
	public onUsersRemoved( members: CUBTMember[] ) {
		this.removedUsers.emit( members );
	}

	/**
	 * @param {CUBTMember[][]} members
	 * @return {void}
	 */
	public onTeamsRemoved( members: CUBTMember[] ) {
		this.removedTeams.emit( members );
	}

	/**
	 * @param {boolean} optionAll
	 * @param {CUBTMember[]} users
	 * @param {CUBTMember[]} teams
	 * @return {void}
	 */
	public onMembersRemoved(
		optionAll: boolean,
		users: CUBTMember[],
		teams: CUBTMember[]
	) {
		this.removed.emit({
			users,
			teams,
			all: optionAll,
		});
	}

	/**
	 * @param {CUBTMember[]} selectedMembers
	 * @param {string[]} selected
	 * @return {void}
	 */
	public onDone( _selectedMembers: CUBTMember[], selected: string[] ) {
		if ( this.required && !selected?.length ) return;

		// this.selectedMembersChange.emit( selectedMembers );
		// this.selectedChange.emit( selected );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public open( event?: Event ) {
		if ( this.isOpened ) return;

		this._menuRef = this._menuService
		.open(
			this._elementRef,
			CUBMemberPickerComponent,
			undefined,
			{
				type: CUBMenuType.FitMenu,
				disableClose: this.disableClose,
			}
		);

		this._menuRef
		.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.opened.emit( event );

				this._instance = this._menuRef.instance;

				// Bind instance's attributes
				this._instance.strictDisplay = this.strictDisplay;
				this._instance.canMultipleSelect = this.canMultipleSelect;
				this._instance.required = this.required;
				this._instance.name = this.name;
				this._instance.label = this.label;
				this._instance.context = this.context;
				this._instance.autoFocusOn = this.autoFocusOn;
				this._instance.hasInput = this.hasInput;
				this._instance.suggestionNumber = this.suggestionNumber;
				this._instance.keySearch = this.keySearch;
				this._instance.values = this.values;

				this._instance.optionAll = this.optionAll;
				this._instance.users = this.users;
				this._instance.teams = this.teams;

				this._instance.selectedAllMembers = this.selectedAllMembers;
				this._instance.selectedUserIDs = this.selectedUserIDs;
				this._instance.selectedTeamIDs = this.selectedTeamIDs;

				this._instance.selectedUsers = this.selectedUsers;
				this._instance.selectedTeams = this.selectedTeams;

				// Bind instance's methods
				this._instance.close
					= this.close.bind( this );
				this._instance.onOptionAllAdded
					= this.onOptionAllAdded.bind( this );
				this._instance.onUsersAdded
					= this.onUsersAdded.bind( this );
				this._instance.onTeamsAdded
					= this.onTeamsAdded.bind( this );
				this._instance.onOptionAllRemoved
					= this.onOptionAllRemoved.bind( this );
				this._instance.onUsersRemoved
					= this.onUsersRemoved.bind( this );
				this._instance.onTeamsRemoved
					= this.onTeamsRemoved.bind( this );

				this._instance.markAsUsersChanges();
				this._instance.markAsTeamsChanges();

				this._instance.markAsSelectedAllMembersChanges();
				this._instance.markAsSelectedUserIDsChanges();
				this._instance.markAsSelectedTeamIDsChanges();

				this._instance.markAsSelectedUsersChanges();
				this._instance.markAsSelectedTeamsChanges();
			},
		});

		this._menuRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => this.closed.emit(),
		});
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public close( event?: Event ) {
		this._menuRef.close();

		this.keySearch = null;

		this.keySearchChange.emit( this.keySearch );
		this.closed.emit( event );
	}

}
