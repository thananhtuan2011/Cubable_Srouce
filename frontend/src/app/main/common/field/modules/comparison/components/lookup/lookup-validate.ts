import _ from 'lodash';

import {
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

export const validateLookupCondition = (
	option: DataValidate<any>,
	validFields: Field[],
	validateControl?: boolean,
	comp?: ComparisonComponent,
	comparisonModule?: ComparisonSource
): ComparisonErrorType => {
	const error: ComparisonErrorType = {
		field: false,
		data: false,
		otherField: false,
	};
	let fieldLK: ObjectType<Field>;

	if ( validFields?.length ) {
		fieldLK = _.keyBy( validFields, 'id' );
	}

	if (
		fieldLK
		&& !fieldLK[ option.fieldID ]
	) return { field: true };

	const validate: ValidateFnType
		= getValidateFn(
			( option as any ).field._lookup.sourceFieldDataType
		);

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

	return error;
};
