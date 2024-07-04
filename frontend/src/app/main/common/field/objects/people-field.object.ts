import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	IPeopleField,
	People,
	PeopleScopeSetting,
	PeopleTypeConfig,
	PeopleData
} from '../interfaces';

import { Field } from './field.object';

export class PeopleField
	extends Field<PeopleData>
	implements IPeopleField {

	public static readonly dataType: DataType
		= DataType.People;

	private _isMultipleSelect: boolean;
	private _isNotifyAdded: boolean;
	private _people: People;
	private _includeSetting: PeopleScopeSetting;
	private _excludeSetting: PeopleScopeSetting;

	get dataType(): DataType {
		return PeopleField.dataType;
	}

	get people(): People {
		return this._people;
	}
	set people( people: People ) {
		this._people = people;
	}

	get includeSetting(): PeopleScopeSetting {
		return this._includeSetting;
	}
	set includeSetting( includeSetting: PeopleScopeSetting ) {
		this._includeSetting = includeSetting;
	}

	get excludeSetting(): PeopleScopeSetting {
		return this._excludeSetting;
	}
	set excludeSetting( excludeSetting: PeopleScopeSetting ) {
		this._excludeSetting = excludeSetting;
	}

	get isMultipleSelect(): boolean {
		return this._isMultipleSelect;
	}
	set isMultipleSelect( isMultipleSelect: boolean ) {
		this._isMultipleSelect = isMultipleSelect;
	}

	get isNotifyAdded(): boolean {
		return this._isNotifyAdded;
	}
	set isNotifyAdded( isNotifyAdded: boolean ) {
		this._isNotifyAdded = isNotifyAdded;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {PeopleData=} data
	 * @param {People=} people
	 * @param {IPeopleScopeSetting=} includeSetting
	 * @param {IPeopleScopeSetting=} excludeSetting
	 * @param {boolean=} isMultipleSelect
	 * @param {boolean=} isNotifyAdded
	 * @param {string=} description
	 * @param {boolean=} isRequired
	 * @param {PeopleData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: PeopleData,
		people?: People,
		includeSetting: PeopleScopeSetting
		= { type: PeopleTypeConfig.ALL_WORKSPACE_MEMBER },
		excludeSetting?: PeopleScopeSetting,
		isMultipleSelect: boolean = true,
		isNotifyAdded?: boolean,
		description?: string,
		isRequired?: boolean,
		initialData?: PeopleData,
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

		this.people = people;
		this.includeSetting = includeSetting;
		this.excludeSetting = excludeSetting;
		this.isMultipleSelect = isMultipleSelect;
		this.isNotifyAdded = isNotifyAdded;
	}

	/**
	 * @param {PeopleData} source
	 * @param {PeopleData=} destination
	 * @return {boolean}
	 */
	public override compareData(
		source: PeopleData,
		destination: PeopleData = this.data
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
			includeSetting: this.includeSetting,
			excludeSetting: this.excludeSetting,
			isMultipleSelect: this.isMultipleSelect,
			isNotifyAdded	: this.isNotifyAdded,
			people: this.people,
			params: JSON.parse(
				JSON.stringify({
					includeSetting: this.includeSetting,
					excludeSetting: this.excludeSetting,
					isMultipleSelect: this.isMultipleSelect,
					isNotifyAdded: this.isNotifyAdded,
					people: this.people,
				})
			),
		};
	}

}
