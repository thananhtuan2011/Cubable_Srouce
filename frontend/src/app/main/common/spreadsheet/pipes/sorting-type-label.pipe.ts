import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Memoize
} from '@core';

import {
	CheckboxField,
	CreatedByField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	Field,
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LinkField,
	LookupField,
	NumberField,
	ParagraphField,
	PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	ReferenceField,
	TextField
} from '../../field/objects';
import {
	DataType,
	Operator
} from '../../field/interfaces';

@Pipe({
	name: 'sortingTypeLabel',
	standalone: true,
})
export class SortingTypeLabel
implements PipeTransform {

	/**
	 * @param {Field} field
	 * @param {boolean=} isAsc
	 * @return {string}
	 */
	@Memoize()
	public transform(
		field: Field,
		isAsc?: boolean
	): string {
		switch (
			field.dataType
		) {
			case TextField.dataType:
			case CheckboxField.dataType:
			case ParagraphField.dataType:
			case LinkField.dataType:
			case EmailField.dataType:
			case PeopleField.dataType:
			case CreatedByField.dataType:
			case LastModifiedByField.dataType:
			case ReferenceField.dataType:
			case FormulaField.dataType:
				return isAsc
					? 'A'
					: 'Z';
			case NumberField.dataType:
			case PhoneField.dataType:
			case CurrencyField.dataType:
			case RatingField.dataType:
			case ProgressField.dataType:
				return isAsc
					? '0'
					: '9';
			case DateField.dataType:
			case CreatedTimeField.dataType:
			case LastModifiedTimeField.dataType:
				return isAsc
					? 'THE_EARLIEST'
					: 'LATEST';
			case DropdownField.dataType:
				return isAsc
					? 'THE_FIRST'
					: 'THE_LAST';
			case LookupField.dataType:
				return this._transformLookup(
					field.extra.params.lookup.operator
					?? (field as LookupField).lookup.targetDataType,
					isAsc,
					field as LookupField
				);
		}
	}

	/**
	 * @param {DataType} targetDataType
	 * @param {boolean} isAsc
	 * @return {string}
	 */
	@Memoize()
	private _transformLookup(
		targetDataType: DataType | Operator,
		isAsc?: boolean,
		field?: LookupField
	): string {

		switch (
			targetDataType
		 ) {
			case TextField.dataType:
			case CheckboxField.dataType:
			case ParagraphField.dataType:
			case LinkField.dataType:
			case EmailField.dataType:
			case PeopleField.dataType:
			case LastModifiedByField.dataType:
			case CreatedByField.dataType:
			case ReferenceField.dataType:
			case FormulaField.dataType:
				return isAsc
					? 'A'
					: 'Z';
			case NumberField.dataType:
			case PhoneField.dataType:
			case CurrencyField.dataType:
			case RatingField.dataType:
			case ProgressField.dataType:
			case Operator.CountAll:
			case Operator.CountAll:
			case Operator.CountValues:
			case Operator.CountUnique:
			case Operator.CountEmpty:
			case Operator.CountNotEmpty:
			case Operator.Sum:
			case Operator.Average:
			case Operator.Min:
			case Operator.Max:
			case Operator.Med:
			case Operator.Range:
			case Operator.CountChecked:
			case Operator.CountUnchecked:
			case Operator.DayRange:
			case Operator.MonthRange:
				return isAsc
					? '0'
					: '9';
			case DateField.dataType:
			case CreatedTimeField.dataType:
			case LastModifiedTimeField.dataType:
			case Operator.EarliestDate:
			case Operator.LatestDate:
				return isAsc
					? 'THE_EARLIEST'
					: 'LATEST';
			case DropdownField.dataType:
				return isAsc
					? 'THE_FIRST'
					: 'THE_LAST';
			case LookupField.dataType:
				return this._transformLookup(
					field
					.lookup
					.targetFieldParams
					.lookup
					.operator ??
					field
					.lookup
					.targetFieldParams
					.lookup
					.targetDataType,
					isAsc
				);
		}
	}
}
