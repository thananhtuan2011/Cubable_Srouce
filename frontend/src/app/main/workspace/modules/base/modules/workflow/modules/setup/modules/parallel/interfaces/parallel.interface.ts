import {
	WorkflowBlockType
} from '../../../../../resources';
import {
	BlockSetup
} from '../../../interfaces';

export type ParallelKey = WorkflowBlockType.PARALLEL;

export type Parallel = BlockSetup & {
	blockType: ParallelKey;
	settings: ParallelSetting;
};

export type ParallelSetting = {
	type: ParallelType;
};

export enum ParallelType {
    ALL = 1,
    ANY,
};

export type ParallelTypeInfo = {
	value: ParallelType;
	name: string;
	description?: string;
};
