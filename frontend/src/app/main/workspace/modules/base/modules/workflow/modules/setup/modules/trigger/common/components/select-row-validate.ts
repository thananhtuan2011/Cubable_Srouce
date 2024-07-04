import {
	singleConditionalValidate
} from '../../../common/conditional';

import {
	RowTrigger
} from '../../interfaces';

import {
	SelectRowComponent
} from './select-row.component';

export const selectRowValidate = (
	row: RowTrigger,
	showInvalidState?: boolean,
	comp?: SelectRowComponent
): boolean => {
	let isValid: boolean = true;

	if ( !row.type ) {
		isValid = false;

		comp
		?.typeControl
		.markAsDirty();
	}

	if ( row.filter ) {
		isValid = singleConditionalValidate(
			row.filter.options,
			showInvalidState,
			comp?.conditionalComp
		) && isValid;
	}

	return isValid;
};
