import {
	Moment
} from 'moment-timezone';
import {
	ULID
} from 'ulidx';

import {
	Trigger
} from '../modules/setup/modules/trigger/interfaces';
import {
	Action
} from '../modules/setup/modules/action/interfaces';
import {
	Condition
} from '../modules/setup/modules/condition/interfaces';
import {
	Delay
} from '../modules/setup/modules/delay/interfaces';
import {
	SubProcess
} from '../modules/setup/modules/sub-process/interfaces';
import {
	End
} from '../modules/setup/modules/end/interfaces';
import {
	Parallel
} from '../modules/setup/modules/parallel/interfaces';
import {
	Merge
} from '../modules/setup/modules/merge/interfaces';
import {
	StartSubProcess
} from '../modules/setup/modules/start-sub-process';
import {
	ExitSubProcess
} from '../modules/setup/modules/exit-sub-process';
import {
	ExitLoop
} from '../modules/setup/modules/loop/interfaces/loop-exit.interface';
import {
	Loop,
	StartLoop
} from '../modules/setup/modules/loop/interfaces';

export type Workflow = {
	id: ULID;
	name: string;
	isActive: boolean;
	baseID: ULID;
	description?: string;
	entryTrigger: Trigger;
	createdAt: Moment;
	createdBy: ULID;
	updatedAt: Moment;
	updatedBy: ULID;
};

export type WorkflowBlock
	= Trigger
		| Action
		| Delay
		| Condition
		| SubProcess
		| End
		| Parallel
		| Merge
		| StartSubProcess
		| ExitSubProcess
		| Loop
		| StartLoop
		| ExitLoop;

export enum TypeAction {
	All = 1,
	Active,
	Inactive
};

export type WorkflowUpdateDesc
	= Partial<Pick<Workflow, 'name' | 'description' | 'entryTrigger' >>;
