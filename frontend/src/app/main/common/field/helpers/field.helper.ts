import _ from 'lodash';

import {
	Field
} from '../objects';
import {
	Field as TField,
	FieldExtra
	// ILookupField
} from '../interfaces';
import {
	FIELD_TYPES
} from '../resources';

export class FieldHelper {

	public static instance: FieldHelper;

	/**
	 * @static
	 * @return {FieldHelper}
	 */
	public static getInstance(): FieldHelper {
		return FieldHelper.instance
			||= new FieldHelper();
	}

	// /**
	//  * @static
	//  * @param {LookupField | ILookupField} field
	//  * @return {DataType}
	//  */
	// public static getLookupTargetFieldDataType( field: LookupField | ILookupField ): DataType {
	// 	if ( !field || !FieldHelper.isLookupField( field.dataType ) ) return;

	// 	const targetField: Field = FieldHelper.getInstance().createField( field.link?.targetField );

	// 	return FieldHelper.isLookupField( targetField.dataType )
	// 		? FieldHelper.getLookupTargetFieldDataType( targetField as LookupField )
	// 		: targetField.dataType;
	// }

	/**
	 * @param {TField} field
	 * @return {Field}
	 */
	public createField( field: TField ): Field {
		const fieldType: ObjectType
			= FIELD_TYPES.get( field.dataType );

		if ( !fieldType ) return;

		const args: any[] = this._parseArgs( field );
		const _field: Field = new fieldType.object(
			field.name,
			undefined,
			...args
		);
		_field.description = field.description;
		_field.isRequired = field.isRequired;
		_field.initialData = field.initialData || _field.initialData;
		_field.extra = field;

		return _field;
	}

	/**
	 * @param {FieldExtra} field
	 * @return {ObjectType[]}
	 */
	private _parseArgs(
		field: FieldExtra
	): ObjectType[] {
		const fieldType: ObjectType
			= FIELD_TYPES.get( field.dataType );
		const params: ObjectType
			= field.params || {};

		return _.map(
			fieldType.args,
			( arg: string ) => params[ arg ]
		);
	}

}
