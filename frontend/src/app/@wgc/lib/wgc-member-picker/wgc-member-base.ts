import {
	ViewChild, Input, Output,
	EventEmitter, Directive
} from '@angular/core';
import { Subject, Observable, isObservable } from 'rxjs';
import _ from 'lodash';

import { CoerceBoolean, CoerceNumber, DefaultValue, untilCmpDestroyed } from '@core';

import { WGCSearchBoxComponent } from '../wgc-search-box';
import { WGCToastService } from '../wgc-toast';
import { WGCMember, WGCIMember, WGCIMemberStatus } from './wgc-member/wgc-member';

@Directive()
export class WGCMemberBase {

	@ViewChild( WGCSearchBoxComponent ) public searchBox: WGCSearchBoxComponent;

	@Input() @DefaultValue() @CoerceBoolean() public strictDisplay: boolean = true;
	@Input() @DefaultValue() @CoerceNumber() public itemSize: number = 44;
	@Input() @CoerceBoolean() public canViewProfile: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public scrolling$: Subject<any>;
	@Input() public context: ObjectType;
	@Input() public selected: string[];
	@Input() public selectedMembers: WGCIMember[];
	@Input() public includesStatus: WGCIMemberStatus[];
	@Input() public members: WGCIMember[] | Observable<WGCIMember[]> | Function;

	@Output() public opened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public viewDetail: EventEmitter<WGCIMember> = new EventEmitter<WGCIMember>();
	@Output() public added: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();
	@Output() public removed: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();
	@Output() public selectedChange: EventEmitter<string[]> = new EventEmitter<string[]>();
	@Output() public selectedMembersChange: EventEmitter<WGCIMember[]> = new EventEmitter<WGCIMember[]>();

	public readonly MEMBER_STATUS: typeof WGCMember.MEMBER_STATUS = WGCMember.MEMBER_STATUS;

	public isChanged: boolean;
	public selectedIndex: number = 0;
	public availableStatus: WGCIMemberStatus[] = [ 1 ];
	public selectedMembersClone: WGCIMember[];
	public _members: WGCIMember[];

	protected bkSelected: string[];

	get availableMembers(): WGCIMember[] {
		return !this.strictDisplay
			? _.unionBy( this._members, this.selectedMembers, 'id' )
			: this._members;
	}

	/**
	 * @constructor
	 * @param {WGCToastService} _wgcToastService
	 */
	constructor( private _wgcToastService: WGCToastService ) {}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public viewProfile( member: WGCIMember ) {
		this.viewDetail.emit( member );
	}

	/**
	 * @return {void}
	 */
	protected done() {
		if ( !this.isChanged ) return;

		if ( this.required && !this.selected?.length ) {
			this.selected = _.clone( this.bkSelected );
			this.selectedMembersClone = _.cloneDeep( this.selectedMembers );

			this._wgcToastService.warning(
				'WGC.MESSAGE.AT_LEAST_ONE_MEMBER',
				{
					translateParams: { name: this.name || this.label },
				}
			);
			return;
		}

		this.isChanged = false;
		this.bkSelected = _.clone( this.selected );

		this.initSelectedMembers();
		this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedChange.emit( this.selected );
	}

	/**
	 * @param {WGCIMember[] | Observable<WGCIMember[]> | Function} members
	 * @return {void}
	 */
	protected setMembers( members: WGCIMember[] | Observable<WGCIMember[]> | Function ) {
		if ( isObservable( members ) ) return;

		if ( _.isFunction( members ) ) {
			this.loadPeople( ( members as Function ).call( this ) );
			return;
		}

		this._members = members as WGCIMember[];

		this.initSelectedMembers();
	}

	/**
	 * @param {Observable<WGCIMember[]>} loader
	 * @return {void}
	 */
	protected loadPeople( loader: Observable<WGCIMember[]> ) {
		if ( !loader ) return;

		// eslint-disable-next-line dot-notation, @typescript-eslint/dot-notation
		loader[ '_context' ] = this.context;

		this._members = [];

		loader
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( members: WGCIMember[] ) => {
			this._members = members;

			this.initSelectedMembers();
		} );
	}

	/**
	 * @return {void}
	 */
	protected initSelectedMembers() {
		const selectedLookup: ObjectType<string> = _.keyBy( this.selected );

		this.selectedMembersClone = _.cloneDeep(
			this.selectedMembers = _.filter(
				this.availableMembers,
				( member: WGCIMember ) => !!member && _.has( selectedLookup, member.id )
			)
		);
	}

}
