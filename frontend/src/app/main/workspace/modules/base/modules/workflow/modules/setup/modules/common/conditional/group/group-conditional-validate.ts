import _ from 'lodash';

import {
	ComparisonErrorType,
	ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';
import {
	ComparisonComponent,
	getValidateFn
} from '@main/common/field/modules/comparison/components';

import {
	GroupConditionalComponent
} from './group-conditional.component';
import {
	GroupOption
} from './group-conditional.interface';

export const groupConditionalValidate = (
	options: GroupOption[],
	markAsDirty?: boolean,
	comp?: GroupConditionalComponent
): boolean => {
	let isValid: boolean = true;

	_.forEach(
		options,
		( option: GroupOption, index: number ) => {
			const val: ValidateFnType
				= getValidateFn( option.field.dataType );
			const sourceComparisonComp: ComparisonComponent
				= comp?.sourceComparisonComps.toArray()[ index ];
			const destinationComparisonComp: ComparisonComponent
				= comp?.destinationComparisonComps.toArray()[ index ];

			const sourceError: ComparisonErrorType
				= val(
					{
						...option,
						...option.source,
					},
					comp?.fields,
					markAsDirty && !comp?.dirtied,
					sourceComparisonComp
				);
			const destinationError: ComparisonErrorType
				= val(
					{
						...option,
						...option.destination,
					},
					comp?.fields,
					markAsDirty && !comp?.dirtied,
					destinationComparisonComp
				);

			if (
				markAsDirty
				&& sourceComparisonComp?.subComparison
			) {
				sourceComparisonComp
				.subComparison
				.cdRef
				.markForCheck();
			}

			isValid
				= _.values( sourceError )
				.indexOf( true ) < 0
				&& _.values( destinationError )
				.indexOf( true ) < 0
				&& isValid;
		}
	);

	return isValid;
};
