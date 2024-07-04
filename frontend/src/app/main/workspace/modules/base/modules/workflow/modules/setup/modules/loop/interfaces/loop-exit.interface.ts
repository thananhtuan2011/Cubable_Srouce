import {
	WorkflowBlockType
} from '../../../../../resources';
import { BlockSetup } from '../../../interfaces';

export type ExitLoopKey
	= WorkflowBlockType.LOOP_EXIT;
export type ExitLoop = BlockSetup & {
	blockType: ExitLoopKey;
	settings?: ExitLoopSetting;
};

export type ExitLoopSetting = {};
