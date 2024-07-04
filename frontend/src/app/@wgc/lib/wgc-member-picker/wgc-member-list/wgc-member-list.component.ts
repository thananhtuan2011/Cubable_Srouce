import {
	Component, ViewEncapsulation, Input,
	OnChanges, SimpleChanges, ChangeDetectorRef,
	ElementRef, HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import { HorizontalConnectionPos, VerticalConnectionPos } from '@angular/cdk/overlay';
import { isObservable } from 'rxjs';
import _ from 'lodash';

import { CoerceBoolean, CoerceNumber, DefaultValue, Unsubscriber } from '@core';

import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCConfirmService } from '../../wgc-confirm';
import { WGCToastService } from '../../wgc-toast';

import { WGCMemberBase } from '../wgc-member-base';
import { WGCIMember, WGCIMemberStatus } from '../wgc-member/wgc-member';
import { WGCIMemberPickerPosition } from '../wgc-member-picker/wgc-member-picker.directive';

@Unsubscriber()
@Component({
	selector		: 'wgc-member-list',
	templateUrl		: './wgc-member-list.pug',
	styleUrls		: [ './wgc-member-list.scss', '../styles/wgc-member-common.scss' ],
	host			: { class: 'wgc-member-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMemberListComponent extends WGCMemberBase implements OnChanges {

	@HostBinding( 'class.wgc-member-list--active' ) get classActive(): boolean { return this.isOpened || !this.selectedMembers?.length || !this.toggleAddButton; };

	@Input() @DefaultValue() @CoerceNumber() public limit: number = 4;
	@Input() @CoerceBoolean() public toggleAddButton: boolean;
	@Input() @CoerceBoolean() public isAutoOpen: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @DefaultValue() public position: WGCIMemberPickerPosition = 'below';
	@Input() public originX: HorizontalConnectionPos;
	@Input() public originY: VerticalConnectionPos;
	@Input() public overlayX: HorizontalConnectionPos;
	@Input() public overlayY: VerticalConnectionPos;

	public isOpened: boolean;
	public filteredSelectedMembers: WGCIMember[];

	private _removedMembers: WGCIMember[];

	get useVirtualScroll(): boolean {
		return this.filteredSelectedMembers?.length >= APP_CONSTANT.USE_VIRTUAL_SCROLL_WITH;
	}

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {WGCToastService} wgcToastService
	 * @param {ChangeDetectorRef} cdRef
	 * @param {WGCConfirmService} _wgcConfirmService
	 */
	constructor(
		public elementRef: ElementRef,
		public cdRef: ChangeDetectorRef,
		protected wgcToastService: WGCToastService,
		private _wgcConfirmService: WGCConfirmService
	) {
		super( wgcToastService );
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 * @return {void}
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.includesStatus ) this.availableStatus = _.uniq([ ...this.availableStatus, ...changes.includesStatus.currentValue ]);

		changes.members && this.setMembers( this.members );
		( changes.selected || changes.selectedMembers ) && this.initSelectedMembers();

		if ( changes.selected ) this.bkSelected = _.clone( this.selected );
	}

	/**
	 * @return {void}
	 */
	public onMoreMenuOpened() {
		this._removedMembers = undefined;
	}

	/**
	 * @return {void}
	 */
	public onMoreMenuClosed() {
		this.selectedIndex = 0;

		if ( !this._removedMembers?.length ) return;

		this.removed.emit( this._removedMembers );
		this.done();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onPickerMenuOpened( event: Event ) {
		isObservable( this.members ) && this.loadPeople( this.members );

		this.isOpened = true;

		this.opened.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onPickerMenuClosed( event: Event ) {
		this.isOpened = false;

		this.closed.emit( event );
	}

	/**
	 * @return {void}
	 */
	public removeAllMembers() {
		this._wgcConfirmService
		.open( 'WGC.MESSAGE.REMOVE_ALL_MEMBERS_CONFIRM' )
		.afterClosed()
		.subscribe( ( answer: boolean ) => {
			if ( !answer ) return;

			this.isChanged = true;

			switch ( this.selectedIndex ) {
				case 0:
					this._deleteMembers( this.MEMBER_STATUS.ACTIVE );
					break;
				case 1:
					this._deleteMembers( this.MEMBER_STATUS.INACTIVE );
					break;
				case 2:
					this._deleteMembers( this.MEMBER_STATUS.WAITING );
					break;
			}

			this.cdRef.detectChanges();
		} );
	}

	/**
	 * @param {WGCIMember} member
	 * @param {boolean=} isDirect
	 * @return {void}
	 */
	public removeMember( member: WGCIMember, isDirect?: boolean ) {
		this.isChanged = true;
		this.selected = _.without( this.selected, member.id );
		this.filteredSelectedMembers = _.without( this.filteredSelectedMembers, member );
		this._removedMembers = _.arrayInsert( this._removedMembers, member );

		_.remove( this.selectedMembersClone, member );

		if ( !isDirect ) return;

		this.removed.emit([ member ]);
		this.done();
	}

	/**
	 * @param {WGCIMemberStatus} status
	 * @return {string[]}
	 */
	private _getSelected( status: WGCIMemberStatus ): string[] {
		const valueLookup: ObjectType<WGCIMember> = _.chain( this.selectedMembers )
		.filter({ status })
		.keyBy( 'id' )
		.value();

		return _.filter( this.selected, ( id: string ) => !_.has( valueLookup, id ) );
	}

	/**
	 * @param {WGCIMemberStatus} status
	 * @return {void}
	 */
	private _deleteMembers( status: WGCIMemberStatus ) {
		this.selectedMembersClone = _.filter( this.selectedMembersClone, ( member: WGCIMember ) => member.status !== status );
		this.selected = this._getSelected( status );
		this._removedMembers = _.unionBy( this._removedMembers, _.filter( this.selectedMembers, { status } ) );
	}

}
