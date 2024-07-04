import {
	IUserTable
} from '../../user/interfaces';
import {
	Role
} from '../../dispensation/interfaces';

import {
	PopMode
} from '../resources';

import {
	ITeam,
	ITeamValue
} from './team.interface';

export interface IDialogTeamResult {
	team: ITeamValue;
}

export type PopupContextTeam = {
	mode: PopMode;
	teams: ITeam[];
	roles: Role[];
	users: IUserTable[];
	team?: ITeam;
};
