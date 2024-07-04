import { ulid } from 'ulidx';
import _ from 'lodash';

import {
	ACCENT_COLORS
} from '@cub/resources';

import {
	DataType,
	DropdownData,
	DropdownOption,
	DropdownOptionValue,
	DropdownReference,
	FieldExtra,
	IDropdownField
} from '../interfaces';

import {
	Field
} from './field.object';

export class DropdownField
	extends Field<DropdownData>
	implements IDropdownField {

	public static readonly dataType: DataType
		= DataType.Dropdown;

	public options: DropdownOption[];
	public reference: DropdownReference;
	public isMultipleSelect: boolean;
	public allowAddSelections: boolean;

	get dataType(): DataType {
		return DropdownField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {DropdownData=} data
	 * @param {DropdownOption[]=} options
	 * @param {DropdownReference=} reference
	 * @param {boolean=} isMultipleSelect
	 * @param {boolean=} allowAddSelections
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {DropdownData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: DropdownData,
		options?: DropdownOption[],
		reference?: DropdownReference,
		isMultipleSelect: boolean = true,
		allowAddSelections: boolean = !reference,
		description?: string,
		isRequired?: boolean,
		initialData?: DropdownData,
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

		this.options = options;
		this.reference = reference;
		this.isMultipleSelect = isMultipleSelect;
		this.allowAddSelections = allowAddSelections;
	}

	/**
	 * @param {string=} name
	 * @return {DropdownOption}
	 */
	public addOption( name?: string ) {
		let i: number = 0;
		let loop: number
			= 0;
		let color: string
			= ACCENT_COLORS[ i ];

		while (
			_.filter(
				this.options,
				{ color }
			).length > loop
		) {
			++i;

			if (
				!ACCENT_COLORS[ i ]
			) {
				++loop;
				i = 0;
			}

			color = ACCENT_COLORS[ i ];
		}

		const newOption: DropdownOption
			= {
				name,
				color,
				value: ulid(),
			};

		this.options ||= [];
		this.options.push( newOption );

		return newOption;
	}

	/**
	 * @param {DropdownOption} option
	 * @return {void}
	 */
	public removeOption(
		option: DropdownOption
	) {
		_.pull( this.options, option );
	}

	/**
	 * @param {DropdownOptionValue} optionValue
	 * @return {void}
	 */
	public addValue(
		optionValue: DropdownOptionValue
	) {
		this.data = {
			value: _.union(
				this.data.value,
				[ optionValue ]
			),
		};
	}

	/**
	 * @param {DropdownOptionValue} optionValue
	 * @return {void}
	 */
	public removeValue(
		optionValue: DropdownOptionValue
	) {
		this.data = {
			value: _.without(
				this.data.value,
				optionValue
			),
		};
	}

	/**
	 * @param {DropdownData=} data
	 * @return {DropdownOption[]}
	 */
	public buildSelected(
		data: DropdownData = this.data
	): DropdownOption[] {
		const lookup: ObjectType<DropdownOption>
			= _.keyBy( this.options, 'value' );

		return _.reduce(
			data.value,
			(
				memo: DropdownOption[],
				v: DropdownOptionValue
			): DropdownOption[] => {
				memo.push(
					lookup[ v ] || null
				);

				return memo;
			},
			[]
		);
	}

	/**
	 * @param {string} text
	 * @return {CheckboxData}
	 */
	public override convertTextToData(
		text: string
	): DropdownData {
		const names: string[]
			= text.split( ',' );

		if ( !names.length ) {
			return;
		}

		const options: DropdownOption[] = [];
		const newOptions: DropdownOption[] = [];

		_.forEach(
			names,
			( name: string ) => {
				name = name.trim();

				let option: DropdownOption
					= _.find( this.options, { name } );

				if ( option ) {
					options.push( option );
				} else if ( this.allowAddSelections ) {
					option = this.addOption( name );

					options.push( option );
					newOptions.push( option );
				}
			}
		);

		if ( !options.length ) {
			return;
		}

		const data: DropdownData = {
			value: _.map( options, 'value' ),
			selected: options,
			newOptions,
		};

		if ( this.validate( data ) !== null ) {
			return;
		}

		return data;
	}

	/**
	 * @param {DropdownData} source
	 * @param {DropdownData=} destination
	 * @return {boolean}
	 */
	public override compareData(
		source: DropdownData,
		destination: DropdownData = this.data
	): boolean {
		return !_.xor(
			source?.value,
			destination?.value
		).length;
	}

	/**
	 * @return {ObjectType}
	 */
	public override toJson(): ObjectType {
		return {
			...super.toJson(),

			options:
				_.clone( this.options ),
			reference:
				_.clone( this.reference ),
			isMultipleSelect:
				this.isMultipleSelect,
			allowAddSelections:
				this.allowAddSelections,
			params: JSON.parse(
				JSON.stringify({
					options: _.clone(
						_.isStrictEmpty( this.options )
							&& _.isStrictEmpty( this.reference )
							? null
							: _.isStrictEmpty( this.options )
								? undefined
								: this.options
					),
					reference:
						_.clone( this.reference ),
					isMultipleSelect:
						this.isMultipleSelect,
					allowAddSelections:
						this.allowAddSelections,
				})
			),
		};
	}

	/**
	 * @param {DropdownData=} data
	 * @return {string}
	 */
	public override toString(
		data: DropdownData = this.data
	): string {
		if ( !data ) {
			return '';
		}

		const lookup: ObjectType<DropdownOptionValue>
			= _.keyBy( data.value );

		return _
		.chain( this.options )
		.reduce(
			(
				memo: string[],
				option: DropdownOption
			): string[] => {
				if ( lookup[ option.value ] ) {
					memo.push( option.name );
				}

				return memo;
			},
			[]
		)
		.join( ', ' )
		.value();
	}

}
