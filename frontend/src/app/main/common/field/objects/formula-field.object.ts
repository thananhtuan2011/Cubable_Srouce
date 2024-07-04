import _ from 'lodash';

import {
	DataType,
	FieldExtra,
	FormulaData,
	IFormulaField
} from '../interfaces';

import { Field } from './field.object';

export class FormulaField
	extends Field<FormulaData>
	implements IFormulaField {

	public static readonly dataType: DataType
		= DataType.Formula;

	get dataType(): DataType {
		return FormulaField.dataType;
	}

	/**
	 * @constructor
	 * @param {string} name
	 * @param {FormulaData=} data
	 * @param {string=} description
	 * @param {FormulaData=} initialData
	 * @param {FieldExtra=} extra
	 */
	constructor(
		name: string,
		data?: FormulaData,
		description?: string,
		initialData?: FormulaData,
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
	}

}
