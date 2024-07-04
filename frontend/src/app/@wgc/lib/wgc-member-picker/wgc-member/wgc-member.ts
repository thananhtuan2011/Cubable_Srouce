import { WGCIAvatar } from '@wgc/wgc-avatar';

interface IStatus {
	ACTIVE: 1;
	INACTIVE: 2;
	WAITING: 3;
}

export type WGCIMemberStatus = 1 | 2 | 3;

export interface WGCIMember {
	id: string;
	name?: string;
	order?: number;
	avatar?: WGCIAvatar;
	status?: WGCIMemberStatus;
}

export class WGCMember {

	public static readonly MEMBER_STATUS: IStatus = { ACTIVE: 1, INACTIVE: 2, WAITING: 3 };

}
