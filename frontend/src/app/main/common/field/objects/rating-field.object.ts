import _ from 'lodash';

import {
	parseNumber
} from '@core/number-parser';

import {
	DataType,
	FieldExtra,
	IRatingField,
	RatingData,
	RatingPoint
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

export class RatingField
	extends Field<RatingData>
	implements IRatingField {

	public static readonly dataType: DataType
		= DataType.Rating;

	public emoji: string;

	private _maxPoint: RatingPoint;

	get dataType(): DataType {
		return RatingField.dataType;
	}

	get maxPoint(): RatingPoint {
		return this._maxPoint;
	}
	set maxPoint( maxPoint: RatingPoint ) {
		this._maxPoint = maxPoint;

		this.validate();
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {RatingData=} data
	 * @param {RatingPoint=} maxPoint
	 * @param {string=} emoji
	 * @param {string=} description
	 * @param {RatingData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: RatingData,
		maxPoint: RatingPoint = 5,
		emoji: string = '2B50',
		description?: string,
		initialData: RatingData = null,
		extra?: FieldExtra
	) {
		super(
			name,
			data,
			description,
			undefined,
			initialData,
			extra
		);

		this.maxPoint = maxPoint;
		this.emoji = emoji;
	}

	/**
	 * @param {RatingData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: RatingData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors
			= super.validate( data );

		if ( _.isFinite( data )
			&& data < 0 ) {
			errors = {
				...errors,
				[ FieldValidationKey.Min ]: {
					field: this,
					data,
					max: 0,
				},
			};
		}

		if ( _.isFinite( data )
			&& data > this.maxPoint ) {
			errors = {
				...errors,
				[ FieldValidationKey.Max ]: {
					field: this,
					data,
					max: this.maxPoint,
				},
			};
		}

		return errors;
	}

	/**
	 * @param {string} text
	 * @return {RatingData}
	 */
	public override convertTextToData(
		text: string
	): RatingData {
		const data: RatingData
			= parseNumber(
				text,
				false,
				true
			) as RatingData;

		if ( !_.isInteger( data )
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
			maxPoint: this.maxPoint,
			emoji: this.emoji,
			params: JSON.parse(
				JSON.stringify({
					maxPoint: this.maxPoint,
					emoji: this.emoji,
				})
			),
		};
	}

}
