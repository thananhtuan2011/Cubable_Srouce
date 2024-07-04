import {
	ULID
} from 'ulidx';

import {
	WorkflowBlock
} from '../../../interfaces';

export type BlockSetupExtra = {
	invalid?: boolean;
	settingDescription?: {
		message?: string;
		iconName?: string;
		iconColor?: string;
	};
};

export type BlockSetup = {
	id: ULID;
	metadata?: BlockSetupMetadata;
	nextBlock: WorkflowBlock | null;
	boardID?: ULID;
	extra?: BlockSetupExtra;
	description?: string;
	labels?: string[];
	childBlocks?: WorkflowBlock[];
	previousBlock?: WorkflowBlock;
	parentBlock?: WorkflowBlock; // block mà childBlock đang nằm trong đó
	subLevel?: number;
	parLevel?: number;
	loopLevel?: number;
};

export type BlockSetupMetadata = {
	index: string;
	name: string;
	childIndex?: number;
};
