import _ from 'lodash';

import {
	Field
} from '@main/common/field/interfaces';

import {
	ComparisonErrorType
} from '../../interfaces';
import {
	ComparisonComponent,
	DataValidate
} from '../../components';

export const validateParagraphCondition = (
	option: DataValidate<undefined>,
	validFields: Field[],
	_validateControl?: boolean,
	_comp?: ComparisonComponent
): ComparisonErrorType => {
	let fieldLK: ObjectType<Field>;

	if ( validFields?.length ) {
		fieldLK = _.keyBy( validFields, 'id' );
	}

	if (
		fieldLK
		&& !fieldLK[ option.fieldID ]
	) return { field: true };

	return {
		field: false,
		data: false,
		otherField: false,
	};
};
