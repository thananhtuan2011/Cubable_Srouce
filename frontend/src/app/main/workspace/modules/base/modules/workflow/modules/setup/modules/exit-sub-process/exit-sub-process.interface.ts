import {
	WorkflowBlockType
} from '../../../../resources';

import {
	BlockSetup
} from '../../interfaces';

export type ExitSubProcessKey
	= WorkflowBlockType.SUB_PROCESS_EXIT;
export type ExitSubProcess = BlockSetup & {
	blockType: ExitSubProcessKey;
	settings?: ExitSubProcessSetting;
};

export type ExitSubProcessSetting = {};
