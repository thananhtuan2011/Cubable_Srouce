import moment
	from 'moment-timezone';
import _ from 'lodash';

import {
	createCUBDate,
	CUBDate,
	isCUBDate
} from '@cub/material/date-picker';

import {
	DataType,
	DATE_FORMATS,
	DateData,
	DateFormat,
	FieldExtra,
	IDateField,
	TimeFormat
} from '../interfaces';

import {
	Field,
	FieldValidationErrors,
	FieldValidationKey
} from './field.object';

// eslint-disable-next-line @typescript-eslint/typedef
const DATE_FORMAT_TRANSLATE = {
	en: {
		today: '[Today]',
		yesterday: '[Yesterday]',
		tomorrow: '[Tomorrow]',
	},
	vi: {
		today: '[Hôm nay]',
		yesterday: '[Hôm qua]',
		tomorrow: '[Ngày mai]',
	},
} as const;
const TODAY: CUBDate = createCUBDate();
const YESTERDAY: CUBDate
	= createCUBDate().subtract( 1, 'days' );
const TOMORROW: CUBDate
	= createCUBDate().add( 1, 'days' );

export const parseDateString: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			date: DateData,
			format: DateFormat,
			timeFormat: TimeFormat
		): string {
			date = isCUBDate( date )
				? date
				: createCUBDate( date );

			if ( !date.isValid() ) {
				return '';
			}

			const dowQuery: string
				= 'dddd';
			let displayFormat: string
				= format || 'L';

			if ( timeFormat ) {
				displayFormat += ` ${timeFormat}`;
			}

			if (
				displayFormat
				.search( dowQuery ) !== -1
			) {
				const locale: string
					= moment.locale();
				const translate: any
					= DATE_FORMAT_TRANSLATE[ locale ];

				if (
					date.isSame(
						TODAY,
						'day'
					)
				) {
					displayFormat
						= displayFormat.replace(
							dowQuery,
							translate.today
						);
				} else if (
					date.isSame(
						YESTERDAY,
						'day'
					)
				) {
					displayFormat
						= displayFormat.replace(
							dowQuery,
							translate.yesterday
						);
				} else if (
					date.isSame(
						TOMORROW,
						'day'
					)
				) {
					displayFormat
						= displayFormat.replace(
							dowQuery,
							translate.tomorrow
						);
				}
			}

			return date.format( displayFormat );
		},
		function(
			date: DateData,
			format: DateFormat,
			timeFormat: TimeFormat
		): string {
			return date
				+ '|'
				+ format
				+ '|'
				+ timeFormat;
		}
	);

export class DateField
	extends Field<DateData>
	implements IDateField {

	public static readonly dataType: DataType
		= DataType.Date;

	public format: DateFormat;
	public timeFormat: TimeFormat;

	get dataType(): DataType {
		return DateField.dataType;
	}

	get inputFormat() {
		let format: string;

		switch ( this.format ) {
			case DATE_FORMATS[ 2 ]:
			case DATE_FORMATS[ 3 ]:
				format = 'YYYY/MM/DD';
				break;
			default:
				format = 'DD/MM/YYYY';
		}

		if ( this.timeFormat ) {
			format += ' HH:mm';
		}

		return format;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {DateData=} data
	 * @param {DateFormat=} format
	 * @param {TimeFormat=} timeFormat
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {DateData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: DateData,
		format: DateFormat = DATE_FORMATS[ 0 ],
		timeFormat: TimeFormat = TimeFormat.None,
		description?: string,
		isRequired?: boolean,
		initialData?: DateData,
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

		this.format = format;
		this.timeFormat = timeFormat;
	}

	/**
	 * @param {DateData=} data
	 * @return {FieldValidationErrors | null}
	 */
	public override validate(
		data: DateData = this.data
	): FieldValidationErrors | null {
		let errors: FieldValidationErrors | null
			= super.validate( data );

		if ( !_.isStrictEmpty( data ) ) {
			if ( isCUBDate( data )
				? !data.isValid()
				: !createCUBDate( data ).isValid() ) {
				errors = {
					...errors,
					[ FieldValidationKey.Pattern ]: {
						field: this,
						data,
					},
				};
			}
		}

		return errors;
	}

	/**
	 * @param {string} text
	 * @return {DateData}
	 */
	public override convertTextToData(
		text: string
	): DateData {
		const data: DateData
			= createCUBDate(
				text,
				this.inputFormat
			);

		if (
			this.validate( data )
				!== null
		) {
			return;
		}

		return data;
	}

	/**
	 * @param {DateData} source
	 * @param {DateData=} destination
	 * @return {boolean}
	 */
	public compareData(
		source: DateData,
		destination: DateData = this.data
	): boolean {
		if ( !isCUBDate( source ) ) {
			source
				= createCUBDate( source );
		}

		if ( !isCUBDate( destination ) ) {
			destination
				= createCUBDate( destination );
		}

		return source.isSame( destination );
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),

			format: this.format,
			timeFormat: this.timeFormat,
			params: JSON.parse(
				JSON.stringify({
					format		: this.format,
					timeFormat	: this.timeFormat,
				})
			),
		};
	}

	/**
	 * @param {DateData=} data
	 * @return {string}
	 */
	public override toString(
		data: DateData = this.data
	): string {
		return parseDateString(
			data,
			this.format,
			this.timeFormat
		);
	}

}
