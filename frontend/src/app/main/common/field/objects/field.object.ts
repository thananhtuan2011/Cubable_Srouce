import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	IField,
	IFieldExtra
} from '../interfaces';

export const FIELD_READONLY: ReadonlySet<DataType>
	= new Set([
		DataType.Lookup,
		DataType.LastModifiedBy,
		DataType.LastModifiedTime,
		DataType.CreatedBy,
		DataType.CreatedTime,
	]);

class FieldExtraAccessor<T = any>
implements Omit<IFieldExtra<T>, 'name' | 'dataType'> {

	protected _extra: FieldExtra<T>;

	get extra(): FieldExtra<T> {
		return this._extra;
	}
	set extra(
		extra: FieldExtra<T>
	) {
		this._extra
			= _.cloneDeep( extra );
	}

	get id(): ULID {
		return _.get(
			this.extra,
			'id'
		);
	}
	set id( id: ULID ) {
		this.extra = _.set(
			this.extra,
			'id',
			id
		);
	}

	get isPrimary(): boolean {
		return _.get(
			this.extra,
			'isPrimary'
		);
	}
	set isPrimary(
		isPrimary: boolean
	) {
		this.extra = _.set(
			this.extra,
			'isPrimary',
			isPrimary
		);
	}

	get isInvalid(): boolean {
		return _.get(
			this.extra,
			'isInvalid'
		);
	}
	set isInvalid(
		isInvalid: boolean
	) {
		this.extra = _.set(
			this.extra,
			'isInvalid',
			isInvalid
		);
	}

	get params(): ObjectType {
		return _.get(
			this.extra,
			'params'
		);
	}
	set params(
		params: ObjectType
	) {
		this.extra = _.set(
			this.extra,
			'params',
			params
		);
	}

}

export enum FieldValidationKey {
	Required = 'required',
	Pattern = 'pattern',
	Min = 'min',
	Max = 'max',
	Other = 'other',
}

export type FieldValidationErrors = {
	[ key in FieldValidationKey ]?: any;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export abstract class Field<T = any>
	extends FieldExtraAccessor<T>
	implements IField<T> {

	public description: string;

	protected _name: string;
	protected _data: T;
	protected _initialValue: T;
	protected _isRequired: boolean;

	abstract get dataType(): DataType;

	get name(): string {
		return this._name;
	}
	set name( name: string ) {
		this._name = name;
	}

	get data(): T {
		return this._data;
	}
	set data( data: T ) {
		this._data
			= _.cloneDeep( data );

		this.validate();
	}

	get isRequired(): boolean {
		return this._isRequired;
	}
	set isRequired(
		isRequired: boolean
	) {
		this._isRequired
			= isRequired;

		this.validate();
	}

	get initialData(): T {
		return this._initialValue;
	}
	set initialData(
		initialData: T
	) {
		this._initialValue
			= !_.isStrictEmpty( initialData )
				? _.cloneDeep( initialData )
				: null;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {T=} data
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {T=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: T,
		description?: string,
		isRequired?: boolean,
		initialData?: T,
		extra?: FieldExtra<T>
	) {
		super();

		this.name = name;
		this.data = data;
		this.description
			= description;
		this.isRequired
			= isRequired;
		this.initialData
			= initialData;
		this.extra = extra;
	}

	/**
	 * @param {T=} data
	 * @param {boolean=} isAllowEmpty
	 * @return {FieldValidationErrors | null}
	 */
	public validate(
		data: T = this.data,
		isAllowEmpty?: boolean
	): FieldValidationErrors | null {
		if ( !isAllowEmpty
			&& this.isRequired
			&& _.isStrictEmpty( data ) ) {
			return {
				[ FieldValidationKey.Required ]:
					true,
			};
		}

		return null;
	}

	/**
	 * @param {string} _text
	 * @return {T}
	 */
	public convertTextToData(
		_text: string
	): T {
		return;
	}

	/**
	 * @param {T} source
	 * @param {T=} destination
	 * @return {boolean}
	 */
	public compareData(
		source: T,
		destination: T = this.data
	): boolean {
		return _.isEqual(
			source,
			destination
		);
	}

	/**
	 * @return {ObjectType}
	 */
	public toJson(): ObjectType {
		return {
			data: _.cloneDeep(
				this.data
			),
		};
	}

	/**
	 * @param {T=} data
	 * @return {string}
	 */
	public toString(
		data: T = this.data
	): string {
		return _.toString( data );
	}

}
