import {
	WorkflowBlockType
} from '../../../../../resources';
import { BlockSetup } from '../../../interfaces';

export type StartLoopKey
	= WorkflowBlockType.LOOP_START;
export type StartLoop = BlockSetup & {
	blockType: StartLoopKey;
	settings?: StartLoopSetting;
};

export type StartLoopSetting = {};
