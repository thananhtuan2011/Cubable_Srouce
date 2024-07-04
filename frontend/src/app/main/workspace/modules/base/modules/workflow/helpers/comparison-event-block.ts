import _ from 'lodash';
import {
	ULID
} from 'ulidx';

import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';

import {
	IBoard
} from '../../board/interfaces';

import {
	WorkflowBlock
} from '../interfaces';
import {
	WorkflowBlockType
} from '../resources';
import {
	ActionType
} from '../modules/setup/modules/action/resources';
import {
	Action
} from '../modules/setup/modules/action/interfaces';
import {
	Trigger
} from '../modules/setup/modules/trigger/interfaces';
import {
	TriggerType
} from '../modules/setup/modules/trigger/resources';

import {
	findBoardId
} from './helper';

export const eventBlock = (
	wfBlock: WorkflowBlock,
	boardsLk: ObjectType<IBoard>,
	isPrev?: boolean
): EventAdvance[] => {
	let previousBlock: WorkflowBlock;

	if ( isPrev ) {
		previousBlock
			= wfBlock;

		wfBlock
			= wfBlock?.previousBlock
				?? wfBlock.parentBlock;
	}

	if ( !wfBlock ) return;

	const events: EventAdvance[] = [];
	const boardID: ULID
		= findBoardId( wfBlock );

	switch ( wfBlock.blockType ) {
		case WorkflowBlockType.TRIGGER:
		case WorkflowBlockType.ACTION:
		case WorkflowBlockType.CONDITION:
			events.push(
				{
					id: wfBlock.id,
					name: _.toString( wfBlock.metadata?.name ),
					boardID,
					boardName: boardsLk[ boardID ]?.name,
					icon: getIcon( wfBlock ),
				} as EventAdvance
			);
			break;
	}


	if (
		previousBlock?.parentBlock?.id
			!== wfBlock?.id
	) {
		_.forEach(
			wfBlock.childBlocks,
			( child: WorkflowBlock ) => {
				if ( child ) {
					events.push(
						...eventBlock(
							child,
							boardsLk,
							false
						)
					);

				}
			}
		);
	}

	if (
		!isPrev
		&& wfBlock.nextBlock
	) {
		events.push(
			...eventBlock(
				wfBlock.nextBlock,
				boardsLk,
				false
			)
		);
	}

	if (
		isPrev
	) {
		const _events: EventAdvance[]
			= eventBlock(
				wfBlock,
				boardsLk,
				isPrev
			);

		events.unshift(
			...( _events || [] )
		);
	}

	return events;
};

export const getIcon = (
	wfBlock: WorkflowBlock
): string => {
	let icon: string;

	switch ( wfBlock.blockType ) {
		case WorkflowBlockType.TRIGGER:
			switch ( ( wfBlock as Trigger ).type ) {
				case TriggerType.ROW_CREATED:
					icon = 'plus-circle';
					break;
				case TriggerType.ROW_DELETED:
					icon = 'trash';
					break;
				case TriggerType.VALUE_CHANGED:
					icon = 'pencil';
					break;
				case TriggerType.DATE_ARRIVES:
					icon = 'assets/images/record-time.svg';
					break;
				case TriggerType.SCHEDULE:
					icon = 'calendar-clock-fill';
					break;
			}
			break;
		case WorkflowBlockType.ACTION:
			switch ( ( wfBlock as Action ).type ) {
				case ActionType.CREATE_ROW:
					icon = 'plus-circle';
					break;
				case ActionType.DELETE_ROW:
					icon = 'trash';
					break;
				case ActionType.CHANGE_VALUE:
					icon = 'pencil';
					break;
				case ActionType.NOTIFY:
					icon = 'assets/images/notify-someone.webp';
					break;
			}
			break;
		case WorkflowBlockType.CONDITION:
			icon = 'branch';
			break;
		case WorkflowBlockType.SUB_PROCESS:
			icon = 'sub-process';
			break;
		case WorkflowBlockType.LOOP:
			icon = 'branch-parallel';
			break;
		case WorkflowBlockType.DELAY:
			icon = 'hourglass';
			break;
		case WorkflowBlockType.MERGE:
			icon = 'branch-merge';
			break;
		case WorkflowBlockType.PARALLEL:
			icon = 'branch-parallel';
			break;
	}

	return icon;
};
