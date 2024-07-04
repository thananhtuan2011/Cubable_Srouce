import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';

import {
	DataType
} from '../../../interfaces';

import {
	ValidateFnType
} from '../interfaces';
import {
	validateAttachmentCondition,
	validateCheckboxCondition,
	validateDateCondition,
	validateDropdownCondition,
	validateEmailCondition,
	validateFormulaCondition,
	validateLookupCondition,
	validateNumberCondition,
	validateParagraphCondition,
	validatePeopleCondition,
	validatePhoneCondition,
	validateProgressCondition,
	validateReferenceCondition,
	validateTextCondition,
	validateLinkCondition,
	validateCurrencyCondition,
	validateRatingCondition
} from '../components';
import {
	ComparisonOperator
} from '../resources';

export type DataValidate<T> = {
	fieldID: ULID;
	operator: ComparisonOperator;
	data: T;
};

export const getValidateFn = (
	fieldType: DataType
) => {
	const validateFn: Map<DataType, ValidateFnType> = new Map([
		[ DataType.Checkbox, validateCheckboxCondition ],

		[ DataType.Dropdown, validateDropdownCondition ],

		[ DataType.Formula, validateFormulaCondition ],

		[ DataType.Phone, validatePhoneCondition ],

		[ DataType.Email, validateEmailCondition ],

		[ DataType.Text, validateTextCondition ],

		[ DataType.Progress, validateProgressCondition as any ],

		[ DataType.Paragraph, validateParagraphCondition ],
		[ DataType.Attachment, validateAttachmentCondition ],
		[ DataType.Link, validateLinkCondition ],
		[ DataType.Lookup, validateLookupCondition ],

		[ DataType.Date, validateDateCondition ],
		[ DataType.CreatedTime, validateDateCondition ],
		[ DataType.LastModifiedTime, validateDateCondition ],

		[ DataType.Number, validateNumberCondition ],
		[ DataType.Currency, validateCurrencyCondition ],
		[ DataType.Rating, validateRatingCondition ],

		[ DataType.People, validatePeopleCondition ],
		[ DataType.LastModifiedBy, validatePeopleCondition ],
		[ DataType.CreatedBy, validatePeopleCondition ],

		[ DataType.Reference, validateReferenceCondition ],
	]);

	return validateFn
	.get(
		fieldType
	) as ValidateFnType;
};

export const validateControlFunc = (
	control: FormControl
) => {
	if (
		control?.dirty
	) return;
	control
	.markAsDirty();
};
