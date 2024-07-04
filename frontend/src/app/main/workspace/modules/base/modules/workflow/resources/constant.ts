/* eslint-disable @typescript-eslint/naming-convention */

export enum WorkflowBlockType {
	TRIGGER = 1,
	CONDITION,
	ACTION,
	DELAY,
	SUB_PROCESS,
	SUB_PROCESS_START,
	SUB_PROCESS_EXIT,
	PARALLEL,
	MERGE,
	END,
	LOOP,
	LOOP_START,
	LOOP_EXIT
};
