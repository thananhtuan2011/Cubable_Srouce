import {
	ChangeDetectionStrategy,
	Component,
	Input,
	HostBinding,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	CoerceCssPixel,
	DefaultValue,
	Unsubscriber
} from '@core';

import {
	CUBAvatarSize,
	CUBAvatarType
} from '../../avatar';

import {
	CUBMember,
	CUBTMember,
	CUBMemberStatus
} from './member';

@Unsubscriber()
@Component({
	selector: 'cub-member',
	templateUrl: './member.pug',
	styleUrls: [ './member.scss', '../styles/member-common.scss' ],
	host: { class: 'cub-member' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMemberComponent {

	@HostBinding( 'style.--label-font-size' )
	get styleLabelFontSize(): string {
		return this.avatarSize === 'small' ? '12px' : '13px';
	}

	@HostBinding( 'style.--margin-data' )
	get styleMarginData(): string {
		return this.avatarSize === 'small' ? '4px' : '8px';
	}

	@Input() @DefaultValue() @CoerceBoolean()
	public hasViewProfile: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean()
	public displayMemberName: boolean = true;
	@Input() @CoerceBoolean()
	public displayMemberStatusHint: boolean = true;
	@Input() @CoerceBoolean()
	public displayRoleName: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public displayMemberStatus: boolean;
	@Input() @CoerceBoolean()
	public hasAvatarOutline: boolean;
	@Input() @CoerceCssPixel()
	public avatarSize: string | CUBAvatarSize;
	@Input() public avatarType: CUBAvatarType;
	@Input() public member: CUBTMember;
	@Input() public searchQuery: string;

	public readonly MEMBER_STATUS: typeof CUBMember.MEMBER_STATUS
		= CUBMember.MEMBER_STATUS;

	/**
	 * @param {CUBMemberStatus} status
	 * @return {string}
	 */
	public static parseStatusIcon(
		status: CUBMemberStatus
	): string {
		let imgName: string;

		switch ( status ) {
			case CUBMember.MEMBER_STATUS.ACTIVE:
				imgName = 'status-active';
				break;
			case CUBMember.MEMBER_STATUS.WAITING:
				imgName = 'status-pending';
				break;
			case CUBMember.MEMBER_STATUS.INACTIVE:
				imgName = 'status-inactive';
				break;
		}

		return `
			<img
				style="width: 20px;
					min-width: 20px;
					max-width: 20px;
					height: 20px;
					min-height: 20px;
					max-height: 20px"
				src="assets/images/icons/${imgName}.webp"
			/>
		`;
	}

}
