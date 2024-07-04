import {
	WorkflowBlockType
} from '../../../../../resources';

import {
	BlockSetup
} from '../../../interfaces';

import {
	EndType
} from '../resources';

export type EndKey = WorkflowBlockType.END;

export type End = BlockSetup & {
	blockType: EndKey;
	type: EndType;
	settings: EndSettings;
};

export type EndSettings = {};
