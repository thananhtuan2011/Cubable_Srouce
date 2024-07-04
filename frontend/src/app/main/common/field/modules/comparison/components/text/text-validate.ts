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
	TextData,
	TextDataCustom
} from './text-comparison.component';

// TODO check validFields
export const validateTextCondition = (
	option: DataValidate<TextData>,
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
		case ComparisonOperator.CONTAINS:
		case ComparisonOperator.DOES_NOT_CONTAINS:
			const data: TextDataCustom
				= option.data as TextDataCustom;

			if (
				data.compareType === ComparisonType.STATIC
				&& _.isStrictEmpty( data.text )
			) {
				error.data = true;
			}

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

			break;
		case ComparisonOperator.STARTS_WITH:
		case ComparisonOperator.ENDS_WITH:
			if (
				_.isStrictEmpty(
					option.data
				)
			) {
				error.data = true;
			};

			break;
		case ComparisonOperator.WORD_COUNT_GREATER_THAN:
		case ComparisonOperator.WORD_COUNT_GREATER_THAN_OR_EQUAL:
		case ComparisonOperator.WORD_COUNT_LESS_THAN:
		case ComparisonOperator.WORD_COUNT_LESS_THAN_OR_EQUAL:
		case ComparisonOperator.WORD_COUNT_EQUAL:
			if (
				_.isStrictEmpty( option.data )
			) {
				error.data = true;
			}

			break;
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
