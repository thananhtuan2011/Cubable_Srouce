import {
	WorkflowBlockType
} from '../../../../../resources';

import {
	BlockSetup
} from '../../../interfaces';

export type MergeKey = WorkflowBlockType.MERGE;

export type Merge = BlockSetup & {
	blockType: MergeKey;
	settings: MergeSetting;
};

export type MergeSetting = {};
