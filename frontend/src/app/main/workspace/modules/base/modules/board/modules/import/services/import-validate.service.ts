import {
	Injectable
} from '@angular/core';
import moment from 'moment';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	REGEXP
} from '@core';

import {
	LinkData,
	TextData,
	DateData,
	PhoneData,
	EmailData,
	RatingData,
	NumberData,
	PeopleData,
	FieldExtra,
	DropdownData,
	CurrencyData,
	CheckboxData,
	ProgressData,
	ReferenceData,
	ParagraphData,
	IDateField,
	IRatingField,
	INumberField,
	IProgressField,
	ICurrencyField,
	ReferenceRecord
} from '@main/common/field/interfaces';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	InfoSheet,
	IValidDate
} from '../interfaces';

@Injectable()
export class ImportValidateService {
	public dataValidate: Record<ULID, IValidDate>;

	/**
	 * @param {InfoSheet} infoSheet
	 * @param {FieldExtra[]} fields
	 */
	public initDataValidate(
		infoSheet: InfoSheet,
		fields: FieldExtra[]
	) {
		this.dataValidate ||= {};

		_.forEach(
			infoSheet.headers,
			( header: string, iCol: number ) => {
				const field: FieldExtra
					= _.find(
						fields,
						( f: FieldExtra ) =>
							_.toUpper( f?.name ) === _.toUpper( header )
					);

				if ( field ) {
					this.dataValidate[ field.id ] = {
						field,
						columns: _.map(
							infoSheet.records,
							( row: any ) => ({
								value: row[ iCol ],
								isError: false,
								header,
							})
						),
					};
				}
			}
		);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {TextData} value
	 * @return {boolean}
	 */
	public fieldText(
		field: FieldExtra,
		value: TextData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		return (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {ParagraphData} value
	 * @return {boolean}
	 */
	public fieldParagraph(
		field: FieldExtra,
		value: ParagraphData
	): boolean {
		//* Skip if the field is not required and the value is empty

		if (!field.isRequired && !value) return false;

		return (field.isRequired && !value?.text);
	};

	/**
	 * @param {FieldExtra} field
	 * @param {CurrencyData} value
	 * @return {boolean}
	 */
	public fieldCurrency(
		field: FieldExtra,
		value: CurrencyData
	): boolean {
		const fieldCurrency: ICurrencyField = field.params as ICurrencyField;
		//* Skip if the field is not required and the value is empty

		if (!field.isRequired && !value) return false;

		if(typeof value !== 'number') return true;

		if(!fieldCurrency.allowNegative && value < 0) return true;

		return (field.isRequired && !value);
	};

	/**
	 * @param {FieldExtra} field
	 * @param {CheckboxData} value
	 * @return {boolean}
	 */
	public fieldCheckbox(
		field: FieldExtra,
		value: CheckboxData
	): boolean {
		const validValues: Set<boolean | string | number>
			= new Set([true, false, 'TRUE', 'FALSE', 'YES', 'NO', 0, 1]);

		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		return (
			!validValues.has(value)
		) || (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {PhoneData} value
	 * @return {boolean}
	 */
	public fieldPhone(
		field: FieldExtra,
		value: PhoneData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		return (
			value && !REGEXP.PHONE.test(value?.phone)
		) || (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {NumberData} value
	 * @return {boolean}
	 */
	public fieldNumber(
		field: FieldExtra,
		value: NumberData
	): boolean {
		const fieldNumber: INumberField
			= field.params as INumberField;

		//* Skip if the field is not required and the value is empty
		if (
			!field.isRequired
			&& !value
		) return false;

		if( typeof value !== 'number' ) return true;

		if(
			!fieldNumber.allowNegative
			&& value < 0
		) return true;

		return field.isRequired && !value;
	}

	/**
	 * @param {FieldExtra} field
	 * @param {DateData} value
	 * @return {boolean}
	 */
	public fieldDate(
		field: FieldExtra,
		value: DateData
	): boolean {
		const fieldDate: IDateField = field.params as IDateField;

		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		const isValidDate: boolean
				= moment(
					value,
					fieldDate.format as string,
					true
				).isValid();

		if(!isValidDate) return true;

		return (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {LinkData} value
	 * @return {boolean}
	 */
	public fieldLink(
		field: FieldExtra,
		value: LinkData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		return (
			value && !REGEXP.URL.test(value?.link)
		) || (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {EmailData} value
	 * @return {boolean}
	 */
	public fieldEmail(
		field: FieldExtra,
		value: EmailData
	): boolean {

		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		if(typeof value !== 'string') return true;

		if(value && !REGEXP.EMAIL.test(value)) return true;

		return (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {RatingData} value
	 * @return {boolean}
	 */
	public fieldRating(
		field: FieldExtra,
		value: RatingData
	): boolean {
		const fieldRating: IRatingField = field.params as IRatingField;

		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		if(typeof value !== 'number') return true;

		const isDecimal: boolean
			= !isNaN(value) && value.toString().indexOf('.') !== -1;

		if(
			fieldRating
			&& (value < 0 || value > fieldRating?.maxPoint || isDecimal)
		) return true;

		return (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {ProgressData} value
	 * @return {boolean}
	 */
	public fieldProgress(
		field: FieldExtra,
		value: ProgressData
	): boolean {
		const fieldProgress: IProgressField
			= field.params as IProgressField;

		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		if (typeof value !== 'number') return true;

		if(
			Number(value) < fieldProgress?.startValue
			|| Number(value) > fieldProgress?.endValue
		) return true;

		return (field.isRequired && !value);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {PeopleData} value
	 * @return {boolean}
	 */
	public fieldPeople(
		field: FieldExtra,
		value: PeopleData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		if (field.isRequired && !value) return true;

		return _.some(value?.selected, (item: IUser) => item.error);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {ReferenceData} value
	 * @return {boolean}
	 */
	public fieldReference(
		field: FieldExtra,
		value: ReferenceData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;


		if (field.isRequired && !value) return true;

		return _.some(value?.selected, (item: ReferenceRecord) => item.error);
	}

	/**
	 * @param {FieldExtra} field
	 * @param {DropdownData} value
	 * @return {boolean}
	 */
	public fieldDropDown(
		field: FieldExtra,
		value: DropdownData
	): boolean {
		//* Skip if the field is not required and the value is empty
		if (!field.isRequired && !value) return false;

		if (field.isRequired && !value) return true;
	}
};
