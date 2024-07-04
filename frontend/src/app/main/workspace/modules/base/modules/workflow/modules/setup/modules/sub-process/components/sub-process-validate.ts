import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	singleConditionalValidate
} from '../../common/conditional';

import {
	SubProcess,
	OtherRecordSetting,
	CompleteSetting,
	SubProcessSetting
} from '../interfaces';
import {
	SubProcessType
} from '../constant';

import {
	OtherRecordComponent
} from './other-record.component';
import {
	SubProcessComponent
} from './sub-process.component';

export const subProcessValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: SubProcessComponent
): boolean => {
	if ( !wfBlock ) return false;

	if ( !( wfBlock as SubProcess ).type ) {
		return false;
	}

	let isValid: boolean = true;

	switch ( ( wfBlock as SubProcess ).type ) {
		case SubProcessType.ROW_FROM_EVENT_BEFORE:
			break;
		case SubProcessType.ROW_MATCH_CONDITION:
			isValid = otherRecord(
				wfBlock.settings as OtherRecordSetting,
				showInvalidState,
				comp?.otherRecordSettingComp as OtherRecordComponent
			) && isValid;
	}

	const completeSetting: CompleteSetting
		= ( wfBlock.settings as SubProcessSetting ).complete;

	if (
		completeSetting?.filter
	) {
		isValid = singleConditionalValidate(
			completeSetting.filter.options,
			showInvalidState,
			comp?.completeSettingComp?.singleConditionalComp
		) && isValid;
	}

	return isValid;
};

const otherRecord = (
	settings: OtherRecordSetting,
	showInvalidState?: boolean,
	comp?: OtherRecordComponent
): boolean => {
	if ( !( comp instanceof OtherRecordComponent ) ) {
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
			comp?.singleConditionalComp
		) && isValid;
	} else {
		isValid = false;
	}

	return isValid;
};
