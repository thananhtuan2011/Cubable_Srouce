import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Memoize
} from '@core';

import {
	AttachmentField,
	CheckboxField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	Field,
	FormulaField,
	LastModifiedTimeField,
	NumberField,
	ParagraphField,
	ProgressField,
	RatingField
} from '@main/common/field/objects';
import {
	DataType
} from '@main/common/field/interfaces';

import {
	CalculatingType
} from '../helpers/calculate';
import {
	CALCULATIONS_TYPE,
	CalculatingMetadata
} from '../resources';

@Pipe({
	name: 'calculatingTypes',
	standalone: true,
})
export class CalculatingTypesPipe
implements PipeTransform {

	/**
	 * @param {Field | DataType} field
	 * @return {CalculatingType[]}
	 */
	@Memoize(function(
		field: Field | DataType
	) {
		return typeof field === 'number'
			? field
			: field.dataType;
	})
	public transform(
		field: Field | DataType
	): CalculatingMetadata[] {
		const dataType: DataType = typeof field === 'number'
			? field
			: field.dataType;
		switch ( dataType ) {
			case AttachmentField.dataType:
			case CheckboxField.dataType:
			case ParagraphField.dataType:
				return [
					CALCULATIONS_TYPE.get( CalculatingType.Empty ),
					CALCULATIONS_TYPE.get( CalculatingType.Filled ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentEmpty ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentFilled ),
				];
			case CreatedTimeField.dataType:
			case DateField.dataType:
			case LastModifiedTimeField.dataType:
				return [
					CALCULATIONS_TYPE.get( CalculatingType.Empty ),
					CALCULATIONS_TYPE.get( CalculatingType.Filled ),
					CALCULATIONS_TYPE.get( CalculatingType.Unique ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentEmpty ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentFilled ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentUnique ),
					CALCULATIONS_TYPE.get( CalculatingType.Min ),
					CALCULATIONS_TYPE.get( CalculatingType.Max ),
					CALCULATIONS_TYPE.get( CalculatingType.DayRange ),
					CALCULATIONS_TYPE.get( CalculatingType.MonthRange ),
				];
			case CurrencyField.dataType:
			case FormulaField.dataType:
			case NumberField.dataType:
			case ProgressField.dataType:
			case RatingField.dataType:
				return [
					CALCULATIONS_TYPE.get( CalculatingType.Empty ),
					CALCULATIONS_TYPE.get( CalculatingType.Filled ),
					CALCULATIONS_TYPE.get( CalculatingType.Unique ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentEmpty ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentFilled ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentUnique ),

					CALCULATIONS_TYPE.get( CalculatingType.Sum ),
					CALCULATIONS_TYPE.get( CalculatingType.Average ),
					CALCULATIONS_TYPE.get( CalculatingType.Median ),
					CALCULATIONS_TYPE.get( CalculatingType.Min ),
					CALCULATIONS_TYPE.get( CalculatingType.Max ),
					CALCULATIONS_TYPE.get( CalculatingType.Range ),
				];
			default:
				return [
					CALCULATIONS_TYPE.get( CalculatingType.Empty ),
					CALCULATIONS_TYPE.get( CalculatingType.Filled ),
					CALCULATIONS_TYPE.get( CalculatingType.Unique ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentEmpty ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentFilled ),
					CALCULATIONS_TYPE.get( CalculatingType.PercentUnique ),
				];
		}
	}

}
