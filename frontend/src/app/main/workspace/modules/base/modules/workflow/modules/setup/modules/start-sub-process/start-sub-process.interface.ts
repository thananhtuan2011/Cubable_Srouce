import {
	WorkflowBlockType
} from '../../../../resources';

import {
	BlockSetup
} from '../../interfaces';

export type StartSubProcessKey
	= WorkflowBlockType.SUB_PROCESS_START;

export type StartSubProcess = BlockSetup & {
	blockType: StartSubProcessKey;
	settings?: StartSubProcessSetting;
};

export type StartSubProcessSetting = {};
