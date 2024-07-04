import {
	Component, Input, OnChanges,
	SimpleChanges, ViewEncapsulation, ViewChild,
	HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import { isObservable } from 'rxjs';
import _ from 'lodash';

import { DefaultValue, Unsubscriber } from '@core';

import { WGCToastService } from '@wgc/wgc-toast';

import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCSearchBoxComponent } from '../../wgc-search-box';

import { WGCIMember, WGCMember } from '../wgc-member/wgc-member';
import { WGCMemberBase } from '../wgc-member-base';

export type WGCIMemberPickerMode = 'default' | 'inline';

@Unsubscriber()
@Component({
	selector		: 'wgc-member-picker',
	templateUrl		: './wgc-member-picker.pug',
	styleUrls		: [ './wgc-member-picker.scss', '../styles/wgc-member-common.scss' ],
	host			: { class: 'wgc-member-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMemberPickerComponent extends WGCMemberBase implements OnChanges {

	@HostBinding( 'style.minWidth' ) get styleWidth(): string { return this.availableStatus?.length < 2 ? '290px' : '360px'; };

	@ViewChild( WGCSearchBoxComponent ) public searchBox: WGCSearchBoxComponent;

	@Input() @DefaultValue() public mode: WGCIMemberPickerMode = 'default';

	public readonly MEMBER_STATUS: typeof WGCMember.MEMBER_STATUS = WGCMember.MEMBER_STATUS;

	public filteredMembers: WGCIMember[];
	public close: ( event?: Event ) => void;
	public onMembersAdded: ( members: WGCIMember[] ) => void;
	public onMembersRemoved: ( members: WGCIMember[] ) => void;
	public onViewProfile: ( member: WGCIMember ) => void;
	public onDone: ( selectedMembers: WGCIMember[], selected: string[] ) => void;

	get useVirtualScroll(): boolean {
		return this.filteredMembers?.length >= APP_CONSTANT.USE_VIRTUAL_SCROLL_WITH;
	}

	/**
	 * @constructor
	 * @param {WGCToastService} wgcToastService
	 */
	constructor( protected wgcToastService: WGCToastService ) {
		super( wgcToastService );
	}

	/**
	 * @constructor
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.includesStatus && this.markAsIncludesStatusChanges();
		changes.members && this.markAsMembersChanges();
		changes.selectedMembers && this.markAsSelectedMembersChanges();
		changes.selected && this.markAsSelectedChanges();
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public addMember( member: WGCIMember ) {
		this.isChanged = true;
		this.selected = _.union( this.selected, [ member.id ] );

		if ( !_.find( this.selectedMembers, { id: member.id } ) ) this.selectedMembers = _.arrayInsert( this.selectedMembers, member );

		this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedChange.emit( this.selected );
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public removeMember( member: WGCIMember ) {
		this.isChanged = true;
		this.selected = _.without( this.selected, member.id );
		this.selectedMembers = _.without( this.selectedMembers, member );

		this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedChange.emit( this.selected );
	}

	/**
	 * @param {WGCIMember[]} members
	 * @return {void}
	 */
	public addMembers( members: WGCIMember[] ) {
		this.isChanged = true;

		_.forEach( members, ( member: WGCIMember ) => this.addMember( member ) );

		this.added.emit( members );

		_.isFunction( this.onMembersAdded ) && this.onMembersAdded( members );

		this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedChange.emit( this.selected );
	}

	/**
	 * @param {WGCIMember[]} members
	 * @return {void}
	 */
	public removeMembers( members: WGCIMember[] ) {
		this.isChanged = true;

		_.forEach( members, ( member: WGCIMember ) => this.removeMember( member ) );

		this.removed.emit( members );

		_.isFunction( this.onMembersRemoved ) && this.onMembersRemoved( members );

		this.selectedMembersChange.emit( this.selectedMembers );
		this.selectedChange.emit( this.selected );
	}

	/**
	 * @return {void}
	 */
	public selectAllMembers() {
		this.addMembers( this.filteredMembers );
	}

	/**
	 * @return {void}
	 */
	public deselectAllMembers() {
		this.removeMembers( this.filteredMembers );
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public toggleMember( member: WGCIMember ) {
		_.includes( this.selected, member.id )
			? this.removeMember( member )
			: this.addMember( member );
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public viewProfile( member: WGCIMember ) {
		super.viewProfile( member );

		_.isFunction( this.onViewProfile ) && this.onViewProfile( member );
	}

	/**
	 * @return {void}
	 */
	public markAsDone() {
		this.done();
	}

	/**
	 * @return {void}
	 */
	public markAsMembersChanges() {
		isObservable( this.members ) ? this.loadPeople( this.members ) : this.setMembers( this.members );
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedChanges() {
		if ( !this.selected ) return;

		this.initSelectedMembers();

		this.bkSelected = _.clone( this.selected );
	}

	/**
	 * @return {void}
	 */
	public markAsSelectedMembersChanges() {
		this.selectedMembers && this.initSelectedMembers();
	}

	/**
	 * @return {void}
	 */
	public markAsIncludesStatusChanges() {
		if ( !this.includesStatus?.length ) return;

		this.availableStatus = _.uniq([ ...this.availableStatus, ...this.includesStatus ]);
	}

	/**
	 * @return {void}
	 */
	protected done() {
		if ( !this.isChanged ) return;

		_.isFunction( this.onDone ) && this.onDone( this.selectedMembers, this.selected );

		super.done();
	}

}
