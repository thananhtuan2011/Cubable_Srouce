import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	singleConditionalValidate
} from '../../common/conditional';

import {
	CompareValueSetting,
	Condition,
	ConditionType,
	FindRecordSetting
} from '../interfaces';

import {
	CompareValueComponent
} from './compare-value.component';
import {
	ConditionBase
} from './condition-base';
import {
	FindRecordComponent
} from './find-record.component';

export const conditionValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: ConditionBase
): boolean => {
	if ( !( wfBlock as Condition ).type ) {
		return false;
	}

	switch ( ( wfBlock as Condition ).type ) {
		case ConditionType.COMPARE_VALUE:
			return compareValue(
				wfBlock.settings as CompareValueSetting,
				showInvalidState,
				comp as CompareValueComponent
			);
		case ConditionType.FIND_RECORD:
			return findRecord(
				wfBlock.settings as FindRecordSetting,
				showInvalidState,
				comp as FindRecordComponent
			);
	}
};

const compareValue = (
	settings: CompareValueSetting,
	showInvalidState?: boolean,
	comp?: CompareValueComponent
): boolean => {
	if ( !( comp instanceof CompareValueComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if ( settings?.filter ) {
		isValid = singleConditionalValidate(
			settings.filter.options,
			showInvalidState,
			comp?.conditionalComp
		) && isValid;
	} else {
		isValid = false;
	}

	return isValid;
};

const findRecord = (
	settings: FindRecordSetting,
	showInvalidState?: boolean,
	comp?: FindRecordComponent
): boolean => {
	if ( !( comp instanceof FindRecordComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if ( !settings?.boardID ) {
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

	if ( settings?.filter ) {
		isValid = singleConditionalValidate(
			settings.filter.options,
			showInvalidState,
			comp?.conditionalComp
		) && isValid;
	} else {
		isValid = false;
	}

	return isValid;
};
