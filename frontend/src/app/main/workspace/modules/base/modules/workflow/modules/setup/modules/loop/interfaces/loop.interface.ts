import {
	WorkflowBlockType
} from '../../../../../resources';
import {
	BlockSetup
} from '../../../interfaces';
import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../../common/conditional';

export type LoopKey
	= WorkflowBlockType.LOOP;

export type LoopSetting = {
	maxLoop: number;
    filter?: ConditionTrigger<SingleOption, SingleCondition>;
};

export type Loop = BlockSetup & {
	blockType: LoopKey;
	settings: LoopSetting;
};
