import _ from 'lodash';

import {
	ComparisonErrorType, ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';
import {
	ComparisonComponent,
	DataValidate,
	getValidateFn
} from '@main/common/field/modules/comparison/components';

import {
	SingleOption
} from './single-conditional.interface';
import {
	SingleConditionalComponent
} from './single-conditional.component';

export const singleConditionalValidate = (
	options: SingleOption[],
	markAsDirty?: boolean,
	comp?: SingleConditionalComponent
): boolean => {
	let isValid: boolean = true;

	_.forEach(
		options,
		( option: SingleOption, index: number ) => {
			const error: ComparisonErrorType
				= singleConditionalCheckAnOption(
					option,
					index,
					markAsDirty && !comp?.dirtied,
					comp
				);

			isValid
				= _.values( error )
				.indexOf( true ) < 0
				&& isValid;
		}
	);

	if ( comp?.expressionEditorComp ) {
		isValid
			= !comp.expressionEditorComp
			.checkSyntax()
				&& isValid;
	}

	if ( comp ) {
		comp.dirtied = true;
	}

	return isValid;
};

export const singleConditionalCheckAnOption = (
	option: SingleOption,
	index: number,
	markAsDirty?: boolean,
	comp?: SingleConditionalComponent
): ComparisonErrorType => {
	const validate: ValidateFnType
		= getValidateFn( option.field.dataType );
	const comparisonComp: ComparisonComponent
		= comp?.comparisonComps.toArray()[ index ];

	const error: ComparisonErrorType
		= validate(
			option as DataValidate<any>,
			comp?.fields,
			markAsDirty && !comp?.dirtied,
			comparisonComp
		);

	if (
		markAsDirty
		&& comparisonComp?.subComparison
	) {
		comparisonComp
		.subComparison
		.cdRef
		.markForCheck();
	}

	return error;
};
