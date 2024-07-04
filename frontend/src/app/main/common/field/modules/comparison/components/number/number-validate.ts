import {
	FormControl
} from '@angular/forms';
import _ from 'lodash';

import {
	Field
} from '@main/common/field/interfaces';
import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';

import {
	ComparisonErrorType,
	ComparisonSource
} from '../../interfaces';
import {
	ComparisonComponent,
	DataValidate,
	validateControlFunc
} from '../../components';

import {
	NumberComparisonComponent,
	NumberData
} from './number-comparison.component';

export const validateNumberCondition = (
	option: DataValidate<NumberData>,
	validFields: Field[],
	validateControl?: boolean,
	comp?: ComparisonComponent,
	comparisonModule?: ComparisonSource
): ComparisonErrorType => {
	let fieldLK: ObjectType<Field>;
	const error: ComparisonErrorType = {
		field: false,
		data: false,
		otherField: false,
	};

	const COMPARISON_SOURCE: typeof ComparisonSource
		= ComparisonSource;

	if ( validFields?.length ) {
		fieldLK = _.keyBy( validFields, 'id' );
	}

	if (
		fieldLK
		&& !fieldLK[ option.fieldID ]
	) {
		error.field = true;
	};

	switch ( option.operator ) {
		case ComparisonOperator.IS_EXACTLY:
		case ComparisonOperator.IS_NOT_EXACTLY:
		case ComparisonOperator.GREATER_THAN:
		case ComparisonOperator.GREATER_THAN_OR_EQUAL:
		case ComparisonOperator.LESS_THAN:
		case ComparisonOperator.LESS_THAN_OR_EQUAL: {
			const data: NumberData
				= option.data as NumberData;

			if (
				data.compareType === ComparisonType.STATIC
				&& _.isStrictEmpty(
					data.number
				)
			) {
				error.data = true;
			};

			if (
				data.compareType === ComparisonType.AUTO
			) {
				if (
					_.isStrictEmpty(
						data.fieldID
					)
					&& _.isStrictEmpty(
						data.targetField
					)
				) {
					error.data = true;
				}

				if (
					data.fieldID
					&& fieldLK
					&& !fieldLK[ data.fieldID ]
				) {
					error.otherField = true;
				}

				if (
					data.targetField
					&& (
						(
							!data.targetField.blockID &&
							comparisonModule === COMPARISON_SOURCE.Workflow
						)
						|| !data.targetField.boardID
						|| !data.targetField.fieldID
					)
				) {
					error.data = true;
				}
			};

			if (
				validateControl
				&& comp?.subComparison
			) {
				comp.subComparison.showErrorData = true;

				validateControlFunc( comp.subComparison.dataControl );
			}

			break;
		}

		case ComparisonOperator.IS_BETWEEN:
		case ComparisonOperator.IS_NOT_BETWEEN: {
			const start: number
				= option.data.start;
			const end: number
				= option.data.end;

			if (
				_.isStrictEmpty( start )
				|| _.isStrictEmpty( end )
				|| end < start
			) {
				error.data = true;
			};

			if (
				validateControl
				&& comp?.subComparison
			) {
				validateControlFunc(
					( comp.subComparison as NumberComparisonComponent )
					.rangeForm
					.controls
					.start as FormControl
				);
				validateControlFunc(
					( comp.subComparison as NumberComparisonComponent )
					.rangeForm
					.controls
					.end as FormControl
				);
			}

			break;
		}
	}

	return error;
};
