import _ from 'lodash';
import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	singleConditionalValidate
} from '../../common/conditional';

import {
	selectRowValidate,
	setRowContentValidate
} from '../common/components';
import {
	Action,
	ChangeValueSetting,
	CreateRowSetting,
	DeleteRowSetting,
	NotifySetting,
	RowAction
} from '../interfaces';
import {
	ActionType, RowActionType
} from '../resources';

import {
	ActionBase
} from './action-base';
import {
	ChangeValueComponent
} from './change-value.component';
import {
	CreateRowComponent
} from './create-row.component';
import {
	DeleteRowComponent
} from './delete-row.component';
import {
	NotifyComponent
} from './notify.component';

export const actionValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: ActionBase
): boolean => {
	switch ( ( wfBlock as Action ).type ) {
		case ActionType.CHANGE_VALUE:
			return changeValue(
				wfBlock.settings as ChangeValueSetting,
				showInvalidState,
				comp as ChangeValueComponent
			);
		case ActionType.CREATE_ROW:
			return createRow(
				wfBlock.settings as CreateRowSetting,
				showInvalidState,
				comp as CreateRowComponent
			);
		case ActionType.DELETE_ROW:
			return deleteRow(
				wfBlock.settings as DeleteRowSetting,
				showInvalidState,
				comp as DeleteRowComponent
			);
		case ActionType.NOTIFY:
			return notify(
				wfBlock.settings as NotifySetting,
				showInvalidState,
				comp as NotifyComponent
			);
	}
};

const changeValue = (
	settings: ChangeValueSetting,
	showInvalidState?: boolean,
	comp?: ChangeValueComponent
): boolean => {
	let isValid: boolean = true;
	const row: RowAction
		= settings?.row;

	if ( row?.type === RowActionType.CONDITION ) {
		if (
			showInvalidState
			&& comp?.selectRowComp?.selectBoardComp
			&& !comp
			.selectRowComp
			.selectBoardComp
			.boardIDControl
			.dirty
		) {
			comp
			.selectRowComp
			.selectBoardComp
			.boardIDControl
			.markAsDirty();
		}

		if ( !row.boardID ) {
			isValid = false;
		}

		if ( row.filter ) {
			isValid = singleConditionalValidate(
				row?.filter?.options,
				showInvalidState,
				comp?.selectRowComp?.conditionalComp
			) && isValid;
		}
	}

	if ( settings ) {
		isValid = setRowContentValidate(
			settings,
			showInvalidState,
			comp?.setRowContentComp
		) && isValid;
	}

	return isValid;
};
const createRow = (
	settings: CreateRowSetting,
	showInvalidState?: boolean,
	comp?: CreateRowComponent
): boolean => {
	let isValid: boolean = true;

	if (
		showInvalidState
		&& comp?.selectBoardComp
		&& !comp
		.selectBoardComp
		.boardIDControl
		.dirty
	) {
		comp
		.selectBoardComp
		.boardIDControl
		.markAsDirty();
	}

	if ( !settings?.boardID ) {
		isValid = false;
	}

	if ( settings?.fields?.length ) {
		isValid = setRowContentValidate(
			settings,
			showInvalidState,
			comp?.setRowContentComp
		)
		&& isValid;
	}

	return isValid;
};
const deleteRow = (
	settings: DeleteRowSetting,
	showInvalidState?: boolean,
	comp?: DeleteRowComponent
): boolean => {
	let isValid: boolean = true;

	if ( settings?.row?.filter ) {
		isValid = selectRowValidate(
			settings.row,
			showInvalidState,
			comp?.selectRowComp
		) && isValid;
	}

	return isValid;
};
const notify = (
	settings: NotifySetting,
	showInvalidState?: boolean,
	comp?: NotifyComponent
): boolean => {
	let isValid: boolean = true;

	// row
	if (
		settings?.row?.filter
	) {
		isValid = selectRowValidate(
			settings.row,
			showInvalidState,
			comp?.selectRowComp
		) && isValid;
	}

	// receivers
	if (
		!settings?.receivers?.baseID?.length
		&& !settings?.receivers?.fieldIDs?.length
		&& !settings?.receivers?.userIDs?.length
		&& !settings?.receivers?.teamIDs?.length
	) {
		isValid = false;

		if (
			showInvalidState
			&& comp?.selectBoardComp
			&& !comp
			.selectBoardComp
			.boardIDControl
			.dirty
		) {
			comp
			.selectBoardComp
			.boardIDControl
			.markAsDirty();
		}
	}

	// subject
	if (
		!settings?.rawSubject?.length
		|| !_.stripHtml( settings?.subject )?.length
		|| _.stripHtml( settings?.subject )?.length > 255
	) {
		isValid = false;
	}

	// message
	if (
		_.stripHtml( settings?.message )?.length > 1000
	) {
		isValid = false;

		if (
			showInvalidState
			&& !comp
			.isMessageChange
		) {
			comp
			.markMessageDirty();
		}
	}

	return isValid;
};
