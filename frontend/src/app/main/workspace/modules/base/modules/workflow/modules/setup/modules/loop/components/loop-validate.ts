import {
	WorkflowBlock
} from '../../../../../interfaces';
import {
	singleConditionalValidate
} from '../../common/conditional';
import {
	LoopSetting
} from '../interfaces';
import {
	LoopComponent
} from './loop.component';

export const loopValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: LoopComponent
): boolean => {
	let isValid: boolean = true;

	if ( !wfBlock ) return isValid = false;

	if(
		!( wfBlock.settings as LoopSetting )?.maxLoop
	) {
		isValid = false;

		if (
			showInvalidState
			&& comp
			&& !comp
			.maxLoopControl
			.dirty
		) {
			comp
			.maxLoopControl
			.markAsDirty();
		}
	}

	if (
		( wfBlock.settings as LoopSetting )?.maxLoop > 100
	) {
		isValid = false;
	}

	if (
		( wfBlock.settings as LoopSetting )?.filter
	) {
		isValid = singleConditionalValidate(
			( wfBlock.settings as LoopSetting ).filter.options,
			showInvalidState,
			comp?.conditionalComp
		) && isValid;
	}

	return isValid;
};
