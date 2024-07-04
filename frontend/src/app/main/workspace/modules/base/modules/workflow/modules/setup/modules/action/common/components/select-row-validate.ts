import {
	singleConditionalValidate
} from '../../../common/conditional';

import {
	RowAction
} from '../../interfaces';

import {
	SelectRowComponent
} from './select-row.component';

export const selectRowValidate = (
	row: RowAction,
	showInvalidState?: boolean,
	comp?: SelectRowComponent
): boolean => {
	let isValid: boolean = true;

	if ( !row.type ) {
		isValid = false;

		comp
		?.typeControl
		.markAsTouched();
	}

	if ( !row.boardID ) {
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

	if (
		row.boardID
		&& row.filter
	) {
		isValid = singleConditionalValidate(
			row.filter.options,
			showInvalidState,
			comp?.conditionalComp
		) && isValid;
	}

	return isValid;
};
