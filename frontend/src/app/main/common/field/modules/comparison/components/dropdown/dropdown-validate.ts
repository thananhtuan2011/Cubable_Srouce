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
	DropdownData
} from './dropdown-comparison.component';

export const validateDropdownCondition = (
	option: DataValidate<DropdownData>,
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
		case ComparisonOperator.IN:
		case ComparisonOperator.NOT_IN: {
			const data: DropdownData
				= option.data as DropdownData;

			if (
				data?.compareType === ComparisonType.STATIC
				&& _.isStrictEmpty(
					data.value
				)
			) {
				error.data = true;
			};

			if (
				data?.compareType === ComparisonType.AUTO
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
				comp?.subComparison
				&& validateControl
			) {
				comp.subComparison.showErrorData = true;

				validateControlFunc( comp.subComparison.dataControl );
			}

			break;
		}
	}

	return error;
};
