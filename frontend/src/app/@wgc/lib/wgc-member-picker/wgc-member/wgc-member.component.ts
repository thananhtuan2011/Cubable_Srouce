import {
	Component, Input, EventEmitter,
	Output, ViewEncapsulation, ChangeDetectionStrategy,
	OnChanges, SimpleChanges
} from '@angular/core';
import { Subject } from 'rxjs';

import { CoerceBoolean, CoerceCssPixel, DefaultValue, Unsubscriber } from '@core';

import { WGCSearchBoxComponent } from '../../wgc-search-box';
import { WGCIAvatarSize } from '../../wgc-avatar';

import { WGCMember, WGCIMember, WGCIMemberStatus } from './wgc-member';

@Unsubscriber()
@Component({
	selector		: 'wgc-member',
	templateUrl		: './wgc-member.pug',
	styleUrls		: [ './wgc-member.scss', '../styles/wgc-member-common.scss' ],
	host			: { class: 'wgc-member' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMemberComponent implements OnChanges {

	@Input() @DefaultValue() @CoerceBoolean() public hasViewProfile: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public displayMemberName: boolean = true;
	@Input() @CoerceBoolean() public displayMemberStatus: boolean;
	@Input() @CoerceBoolean() public canViewProfile: boolean;
	@Input() @CoerceCssPixel() public size: string | WGCIAvatarSize;
	@Input() public scrolling$: Subject<any>;
	@Input() public member: WGCIMember;
	@Input() public searchBox: WGCSearchBoxComponent;

	@Output() public viewDetail: EventEmitter<WGCIMember> = new EventEmitter<WGCIMember>();

	public readonly MEMBER_STATUS: typeof WGCMember.MEMBER_STATUS = WGCMember.MEMBER_STATUS;

	/**
	 * @param {WGCIMemberStatus} status
	 * @return {string}
	 */
	public static parseStatusIcon( status: WGCIMemberStatus ): string {
		let imgName: string;

		switch ( status ) {
			case WGCMember.MEMBER_STATUS.ACTIVE:
				imgName = 'status-active';
				break;
			case WGCMember.MEMBER_STATUS.WAITING:
				imgName = 'status-pending';
				break;
			case WGCMember.MEMBER_STATUS.INACTIVE:
				imgName = 'status-inactive';
				break;
		}

		return `
			<img
				style="width: 20px; min-width: 20px; max-width: 20px; height: 20px; min-height: 20px; max-height: 20px"
				src="assets/images/icons/${imgName}.webp"
			/>
		`;
	}

	/**
	 * @constructor
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.member?.currentValue?.status !== this.MEMBER_STATUS.INACTIVE ) return;

		this.member.avatar = { ...this.member.avatar, mode: 'photo', photo: 'assets/images/icons/user-inactive.webp' };
	}

	/**
	 * @param {WGCIMember} member
	 * @return {void}
	 */
	public viewProfile( member: WGCIMember ) {
		this.viewDetail.emit( member );
	}

}
