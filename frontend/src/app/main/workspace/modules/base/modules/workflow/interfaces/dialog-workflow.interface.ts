import {
	IBase
} from '../../../interfaces';

export type DialogWorkflowContext = {
	base: IBase;
};

export type PopupWorkflowContext = {
	createBy: string;
	updateBy: string;
};
