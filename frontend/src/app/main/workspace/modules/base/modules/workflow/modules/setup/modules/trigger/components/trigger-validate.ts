import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	groupConditionalValidate,
	singleConditionalValidate
} from '../../common/conditional';

import {
	DateArrivesSetting,
	RowCreatedSetting,
	RowDeleteSetting,
	ValueChangedSetting,
	AtScheduleTimeSetting,
	Trigger
} from '../interfaces';
import {
	ScheduleType,
	TriggerType,
	TypeTimeOption
} from '../resources';
import {
	selectRowValidate
} from '../common/components';

import {
	AtScheduledTimeComponent
} from './at-scheduled-time.component';
import {
	DateArrivesComponent
} from './date-arrives.component';
import {
	RowCreatedComponent
} from './row-created.component';
import {
	RowDeleteComponent
} from './row-deleted.component';
import {
	TriggerBase
} from './trigger-base';
import {
	ValueChangedComponent
} from './value-changed.component';

export const triggerValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: TriggerBase
): boolean => {
	if ( !( wfBlock as Trigger ).type ) {
		return false;
	}

	switch ( ( wfBlock as Trigger ).type ) {
		case TriggerType.VALUE_CHANGED:
			return valueChanged(
				wfBlock.settings as ValueChangedSetting,
				showInvalidState,
				comp as ValueChangedComponent
			);
		case TriggerType.ROW_CREATED:
			return rowCreated(
				wfBlock.settings as RowCreatedSetting,
				showInvalidState,
				comp as RowCreatedComponent
			);
		case TriggerType.ROW_DELETED:
			return rowDeleted(
				wfBlock.settings as RowDeleteSetting,
				showInvalidState,
				comp as RowDeleteComponent
			);
		case TriggerType.DATE_ARRIVES:
			return dateArrives(
				wfBlock.settings as DateArrivesSetting,
				showInvalidState,
				comp as DateArrivesComponent
			);
		case TriggerType.SCHEDULE:
			return schedule(
				wfBlock.settings as AtScheduleTimeSetting,
				showInvalidState,
				comp as AtScheduledTimeComponent
			);
	}
};

const valueChanged = (
	settings: ValueChangedSetting,
	showInvalidState?: boolean,
	comp?: ValueChangedComponent
): boolean => {
	if ( !( comp instanceof ValueChangedComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if ( !settings?.boardID ) {
		isValid = false;

		if (
			showInvalidState
			&& comp?.selectBoardCmp
			&& !comp
			.selectBoardCmp
			.boardIDControl
			.dirty
		) {
			comp
			.selectBoardCmp
			.boardIDControl
			.markAsDirty();
		}
	}

	if ( settings?.row?.filter ) {
		isValid = selectRowValidate(
			settings.row,
			showInvalidState,
			comp?.selectRowComp
		) && isValid;
	}

	if ( settings?.field?.filter ) {
		isValid = groupConditionalValidate(
			settings.field.filter.options,
			showInvalidState,
			comp?.groupConditionalComp
		) && isValid;
	}

	return isValid;
};
const rowCreated = (
	settings: RowCreatedSetting,
	showInvalidState?: boolean,
	comp?: RowCreatedComponent
): boolean => {
	if ( !( comp instanceof RowCreatedComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if ( !settings?.boardID ) {
		isValid = false;

		if (
			showInvalidState
			&& comp?.selectBoardCmp
			&& !comp
			.selectBoardCmp
			.boardIDControl
			.dirty
		) {
			comp
			.selectBoardCmp
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
	}

	return isValid;
};
const rowDeleted = (
	settings: RowDeleteSetting,
	showInvalidState?: boolean,
	comp?: RowDeleteComponent
): boolean => {
	if ( !( comp instanceof RowDeleteComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if ( !settings?.boardID ) {
		isValid = false;

		if (
			showInvalidState
			&& comp?.selectBoardCmp
			&& !comp
			.selectBoardCmp
			.boardIDControl
			.dirty
		) {
			comp
			.selectBoardCmp
			.boardIDControl
			.markAsDirty();
		}
	}

	if ( settings?.row?.filter ) {
		isValid = selectRowValidate(
			settings.row,
			showInvalidState,
			comp?.selectRowComp
		) && isValid;
	}

	return isValid;
};
const dateArrives = (
	settings: DateArrivesSetting,
	showInvalidState?: boolean,
	comp?: DateArrivesComponent
): boolean => {
	if ( !( comp instanceof DateArrivesComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if( !settings?.boardID ) {
		isValid = false;

		if (
			showInvalidState
			&& comp?.selectBoardCmp
			&& !comp
			.selectBoardCmp
			.boardIDControl
			.dirty
		) {
			comp
			.selectBoardCmp
			.boardIDControl
			.markAsDirty();
		}
	}

	if( !settings?.dateSelection?.fieldID ) {
		isValid = false;

		if (
			showInvalidState
			&& comp
		) {
			comp.typeControl.markAsDirty();
		}

		return;
	}

	if(
		comp
		&& comp.currentRadio === TypeTimeOption.TIME
		&& !settings?.dateSelection?.time
	) {
		isValid = false;

		if (
			showInvalidState
			&& comp
			&& !comp
			.timeEventControl
			.dirty
		) {
			comp
			.timeEventControl
			.markAsDirty();
		}
		return;
	}

	if(
		comp
		&& comp.currentRadio === TypeTimeOption.DATE
		&& (
			!settings?.dateSelection?.date?.quantity
			|| !settings?.dateSelection?.date?.period
			|| !settings?.dateSelection?.date?.positionTime
			|| !settings?.dateSelection?.date?.time
		)
	) {

		isValid = false;

		if (
			showInvalidState
			&& comp
			&& !comp
			.dateForm
			.get('quantity')
			.dirty
		) {
			comp.dateForm.get('quantity').markAsDirty();
		}

		if (
			showInvalidState
			&& comp
			&& !comp
			.dateForm
			.get('period')
			.dirty
		) {
			comp.dateForm.get('period').markAsDirty();
		}

		if (
			showInvalidState
			&& comp
			&& !comp
			.dateForm
			.get('positionTime')
			.dirty
		) {
			comp.dateForm.get('positionTime').markAsDirty();
		}

		if (
			showInvalidState
			&& comp
			&& !comp
			.dateForm
			.get('timeDay')
			.dirty
		) {
			comp.dateForm.get('timeDay').markAsDirty();
		}

		return;
	}

	if (
		comp
		&& comp.currentRadio === TypeTimeOption.SCHEDULE
		&& (
			!settings?.dateSelection?.schedule?.frequency
			|| !settings?.dateSelection?.schedule?.time
		)
	) {
		isValid = false;

		if (
			showInvalidState
			&& comp
			&& !comp
			.scheduleForm
			.get('frequency')
			.dirty
		) {
			comp.scheduleForm.get('frequency').markAsDirty();
		}

		if (
			showInvalidState
			&& comp
			&& !comp
			.scheduleForm
			.get('timeRepeat')
			.dirty
		) {
			comp.scheduleForm.get('timeRepeat').markAsDirty();
		}

		return;
	}

	return isValid;
};
const schedule = (
	settings: AtScheduleTimeSetting,
	showInvalidState?: boolean,
	comp?: AtScheduledTimeComponent
): boolean => {
	if ( !( comp instanceof AtScheduledTimeComponent ) ) {
		comp = undefined;
	}

	let isValid: boolean = true;

	const scheduleDetail: any
		= settings?.scheduleDetail;

	if ( !settings?.type ) {
		isValid = false;

		return isValid;
	}

	if (
		scheduleDetail?.date && scheduleDetail?.time
		|| ( scheduleDetail?.dateFrom
			&& scheduleDetail?.time
			&& settings?.type === ScheduleType.DAILY )
		|| ( scheduleDetail?.selectDayOfWeek
			&& scheduleDetail?.dateFrom
			&& scheduleDetail?.time )
		|| ( ( scheduleDetail?.selectDayOfMonth
			|| scheduleDetail?.lastDayOfMonth )
			&& scheduleDetail?.time
			&& scheduleDetail?.dateFrom
			&& settings?.type === ScheduleType.MONTHLY )
		|| ( scheduleDetail?.selectMonth
			&& scheduleDetail?.selectDayOfMonth
			&& scheduleDetail?.time
			&& scheduleDetail?.dateFrom )
	) {
		isValid = true;
	} else {
		isValid = false;

		if (
			showInvalidState
			&& comp
		) {
			if ( !scheduleDetail?.date ) {
				comp
				.selectDateControl
				.markAsDirty();
			}

			if ( !scheduleDetail?.time ) {
				comp
				.selectTimeControl
				.markAsDirty();
			}

			if ( !scheduleDetail?.dateFrom ) {
				comp
				.dateFromControl
				.markAsDirty();
			}
		}
	}

	return isValid;
};
