import {
	ITeamStatus
} from '../interfaces';

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const CONSTANT = {
	DEFAULT_LIMIT_API	: 50,
	FIELD_ID			: { NAME: 'name', STATUS: 'status', TEAM_MEMBER: 'teamMember' },
} as const;

export enum PopMode {
	New,
	Edit,
}

export const STATUS_TEAM:
	ReadonlyMap<boolean, ITeamStatus>
		= new Map([
			[
				true,
				{
					color: '#53CD52',
					value: 'active',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.STATUS_ACTIVE',
				},
			],

			[
				false,
				{
					color: '#FB6514',
					value: 'inactive',
					label: 'SETTINGS.WORKSPACE.USER_SYSTEM.TEAM.LABEL.STATUS_INACTIVE',
				},
			],
		]);
