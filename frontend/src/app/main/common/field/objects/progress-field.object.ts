import _ from 'lodash';

import {
	parseNumber
} from '@core/number-parser';

import {
	DataType,
	FieldExtra,
	IProgressField,
	ProgressData
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export class ProgressField
	extends Field<ProgressData>
	implements IProgressField {

	public static readonly dataType: DataType
		= DataType.Progress;

	public isAuto: boolean;

	private _startValue: ProgressData;
	private _endValue: ProgressData;

	get dataType(): DataType {
		return ProgressField.dataType;
	}

	get startValue(): ProgressData {
		return this._startValue;
	}
	set startValue( data: ProgressData ) {
		this._startValue = data;

		this.validate();
	}

	get endValue(): ProgressData {
		return this._endValue;
	}
	set endValue( data: ProgressData ) {
		this._endValue = data;

		this.validate();
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {ProgressData=} data
	 * @param {boolean=} isAuto
	 * @param {ProgressData=} startValue
	 * @param {ProgressData=} endValue
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {ProgressData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: ProgressData,
		isAuto: boolean = false,
		startValue: number = 0,
		endValue: number = 1,
		description?: string,
		isRequired?: boolean,
		initialData?: ProgressData,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			description,
			isRequired,
			initialData,
			extra
		);

		this.isAuto = isAuto;
		this.startValue = startValue;
		this.endValue = endValue;
	}

	/**
	 * @param {ProgressData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: ProgressData = this.data
	): FieldValidationErrors | null {
		if ( this.isAuto ) return null;

		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( data < this.startValue ) {
			errors = {
				...errors,
				[ FieldValidationKey.Min ]: {
					field: this,
					data,
					min: this.startValue,
				},
			};
		}

		if ( data > this.endValue ) {
			errors = {
				...errors,
				[ FieldValidationKey.Max ]: {
					field: this,
					data,
					max: this.endValue,
				},
			};
		}

		return errors;
	}

	/**
	 * @param {string} text
	 * @return {ProgressData}
	 */
	public override convertTextToData(
		text: string
	): ProgressData {
		const data: ProgressData
			= parseFloat(
				parseNumber( text, false )
				.toFixed( 2 )
			);

		if ( !_.isFinite( data )
			|| this.validate( data ) !== null ) {
			return;
		}

		return data;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),
			isAuto: this.isAuto,
			startValue: this.startValue,
			endValue: this.endValue,
			params: JSON.parse(
				JSON.stringify({
					isAuto: this.isAuto,
					startValue: this.startValue,
					endValue: this.endValue,
				})
			),
		};
	}

	/**
	 * @param {ProgressData=} data
	 * @return {string}
	 */
	public override toString(
		data: ProgressData = this.data
	): string {
		return _.isFinite( data )
			? `${( data * 100 ).toFixed( 0 )}%`
			: '';
	}

}
