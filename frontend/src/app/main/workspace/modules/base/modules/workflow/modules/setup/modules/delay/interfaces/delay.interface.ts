import {
	WorkflowBlockType
} from '../../../../../resources';
import {
	BlockSetup
} from '../../../interfaces';

import {
	DelayPeriod
} from '../resources';

export type DelayKey = WorkflowBlockType.DELAY;

export type Delay = BlockSetup & {
	blockType: DelayKey;
	settings: DelaySetting;
};

export type DelaySetting = {
	quantity: number;
	period: DelayPeriod;
};

export type PeriodOption = {
	label: string;
	period: number;
};
