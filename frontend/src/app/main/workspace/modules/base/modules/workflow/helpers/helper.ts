import {
	ULID
} from 'ulidx';

import {
	WorkflowBlock
} from '../interfaces';
import {
	WorkflowBlockType
} from '../resources';
import {
	ActionType,
	RowActionType
} from '../modules/setup/modules/action/resources';
import {
	ChangeValueSetting,
	CreateRowSetting, DeleteRowSetting
} from '../modules/setup/modules/action/interfaces';
import {
	TriggerType
} from '../modules/setup/modules/trigger/resources';
import {
	DateArrivesSetting,
	RowCreatedSetting,
	RowDeleteSetting,
	ValueChangedSetting
} from '../modules/setup/modules/trigger/interfaces';
import {
	ConditionType,
	FindRecordSetting
} from '../modules/setup/modules/condition/interfaces';
import {
	SubProcessType
} from '../modules/setup/modules/sub-process/constant';

export const findBoardId = (
	wfBlock: WorkflowBlock
): ULID => {
	if ( !wfBlock ) return;

	let boardId: ULID;

	switch ( wfBlock.blockType ) {
		case WorkflowBlockType.TRIGGER:
			switch ( wfBlock.type ) {
				case TriggerType.ROW_CREATED:
					boardId
						= wfBlock.isEntry
							? (
								wfBlock.settings as RowCreatedSetting
							)?.boardID
							: wfBlock.boardID;
					break;
				case TriggerType.ROW_DELETED:
					boardId
						= wfBlock.isEntry
							? (
								wfBlock.settings as RowDeleteSetting
							)?.boardID
							: wfBlock.boardID;
					break;
				case TriggerType.VALUE_CHANGED:
					boardId
						= wfBlock.isEntry
							? (
								wfBlock.settings as ValueChangedSetting
							)?.boardID
							: wfBlock.boardID;
					break;
				case TriggerType.DATE_ARRIVES:
					boardId
						= wfBlock.isEntry
							? (
								wfBlock.settings as DateArrivesSetting
							)?.boardID
							: wfBlock.boardID;
					break;
				case TriggerType.SCHEDULE:
					boardId = wfBlock.boardID;
					break;
			}
			break;
		case WorkflowBlockType.ACTION:
			switch ( wfBlock.type ) {
				case ActionType.CREATE_ROW:
					boardId = ( wfBlock.settings as CreateRowSetting ).boardID;
					break;
				case ActionType.DELETE_ROW:
					const deleteRowSettings: DeleteRowSetting
						= wfBlock.settings as DeleteRowSetting;

					switch ( deleteRowSettings?.row?.type ) {
						case RowActionType.ROW_FROM_EVENT_BEFORE:
							boardId = wfBlock.boardID;
							break;
						case RowActionType.CONDITION:
							boardId = deleteRowSettings?.row?.boardID;
							break;
					}

					break;
				case ActionType.CHANGE_VALUE:
				case ActionType.NOTIFY:
					const changeValueSettings: ChangeValueSetting
						= wfBlock.settings as ChangeValueSetting;

					switch ( changeValueSettings?.row?.type ) {
						case RowActionType.ROW_FROM_EVENT_BEFORE:
							boardId = wfBlock.boardID;
							break;
						case RowActionType.CONDITION:
							boardId = changeValueSettings?.row?.boardID;
							break;
					}

					break;
			}
			break;
		case WorkflowBlockType.CONDITION:
			switch ( wfBlock.type ) {
				case ConditionType.COMPARE_VALUE:
					boardId = wfBlock.boardID;
					break;
				case ConditionType.FIND_RECORD:
					boardId = (
						wfBlock.settings as FindRecordSetting
					)?.boardID;
					break;
			}
			break;
		case WorkflowBlockType.SUB_PROCESS:
			switch ( wfBlock.type ) {
				case SubProcessType.ROW_FROM_EVENT_BEFORE:
					boardId
						= wfBlock.settings.boardID;
					break;
				case SubProcessType.ROW_MATCH_CONDITION:
					boardId
						= wfBlock.settings.boardID;
					break;
			}
			boardId = wfBlock.boardID;
			break;
		case WorkflowBlockType.DELAY:
		case WorkflowBlockType.PARALLEL:
		case WorkflowBlockType.MERGE:
		case WorkflowBlockType.SUB_PROCESS_EXIT:
		case WorkflowBlockType.SUB_PROCESS_START:
		case WorkflowBlockType.LOOP:
		case WorkflowBlockType.LOOP_EXIT:
		case WorkflowBlockType.LOOP_START:
			boardId = wfBlock.boardID;
			break;
	}

	return boardId;
};
