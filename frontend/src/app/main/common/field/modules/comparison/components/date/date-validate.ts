import _ from 'lodash';

import {
	Field
} from '@main/common/field/interfaces';
import {
	ComparisonOperator,
	ComparisonType,
	TimePeriodPrefixType
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
	TimeData
} from './date-comparison-base';

export const validateDateCondition = (
	option: DataValidate<TimeData>,
	validFields: Field[],
	validateControl?: boolean,
	comp?: ComparisonComponent,
	comparisonModule?: ComparisonSource
): ComparisonErrorType => {
	let fieldLK: ObjectType<Field>;
	const data: TimeData
		= option.data as TimeData;
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
		case ComparisonOperator.IS_BETWEEN:
		case ComparisonOperator.IS_NOT_BETWEEN: {
			if (
				_.isStrictEmpty( option.data?.start )
				|| _.isStrictEmpty( option.data?.end )
				|| option.data?.start >= option.data?.end
			) {
				error.data = true;
			};

			break;
		}

		case ComparisonOperator.IS_EXACTLY:
		case ComparisonOperator.IS_BEFORE:
		case ComparisonOperator.IS_AFTER:
		case ComparisonOperator.IS_NOT_EXACTLY:
			if ( !data?.compareType ) {
				error.data = true;
			} else if (
				data.compareType === ComparisonType.STATIC
				&& _.isStrictEmpty(
					data.date
				)
			) {
				error.data = true;
			} else if (
				data.compareType === ComparisonType.AUTO
			) {
				if (
					_.isStrictEmpty(
						data.fieldID
					)
					&& _.isStrictEmpty(
						data.targetField
					)
					&& _.isStrictEmpty(
						data.specific
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

			break;
		case ComparisonOperator.COMPARE_TODAY: {
			if (
				data?.prefix !== TimePeriodPrefixType.THIS
				&& ( _.isStrictEmpty( data.quantity )
					|| data.quantity < 1 )
			) {
				error.data = true;
			}

			break;
		}
	}

	if (
		validateControl
		&& comp?.subComparison
	) {
		comp.subComparison.showErrorData = true;

		validateControlFunc( comp.subComparison.dataControl );
	}

	return error;
};
