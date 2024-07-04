import _ from 'lodash';

import {
	DataType,
	Field
} from '@main/common/field/interfaces';

import {
	ComparisonErrorType,
	ComparisonSource,
	ValidateFnType
} from '../../interfaces';
import {
	ComparisonComponent,
	DataValidate,
	getValidateFn
} from '../../components';

import {
	FormulaData,
	FormulaType
} from './formula-comparison.component';

export const validateFormulaCondition = (
	option: DataValidate<FormulaData>,
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

	if ( validFields?.length ) {
		fieldLK = _.keyBy( validFields, 'id' );
	}

	if (
		fieldLK
		&& !fieldLK[ option.fieldID ]
	) {
		error.field = true;
	};

	switch( option.data.formulaType ) {
		case FormulaType.NUMBER: {
			const validate: ValidateFnType
				= getValidateFn( DataType.Number );

			const _error: ComparisonErrorType
				= validate(
					option,
					validFields,
					validateControl,
					comp?.formulaComparison,
					comparisonModule
				);

			error.otherField = _error.otherField;
			error.data = _error.data;
		}
	}

	return error;
};
