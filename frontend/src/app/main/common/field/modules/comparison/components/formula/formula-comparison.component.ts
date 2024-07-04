import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewChild
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';

import {
	CoerceArray
} from '@core';

import {
	CUBFormFieldDisplayErrorMode
} from '@cub/material/form-field';
import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	Field,
	FormulaField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	TComparisonOperator
} from '../../interfaces';

import {
	NumberComparisonComponent,
	NumberData
} from '../number/number-comparison.component';

export enum FormulaType {
	NUMBER = 1,
	TEXT = 2,
	DATE = 3,
}

function setFormulaType(
	value: FormulaType,
	label: string
): TFormulaType {
	return {
		value,
		label: `FIELD.COMPARISON.FORMULA_TYPE.${label}`,
	};
}

const formulaTypes: TFormulaType[] = [
	setFormulaType(
		FormulaType.NUMBER,
		'NUMBER'
	),
];

export type TFormulaType = {
	value: FormulaType;
	label: string;
};

export type FormulaDefault = {
	formulaType: FormulaType;
	compareType: ComparisonType;
	operator: ComparisonOperator;
};

export type FormulaData = NumberData & {
	formulaType: FormulaType;
};

@Component({
	selector: 'formula-comparison',
	templateUrl: './formula-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'formula-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaComparisonComponent
	extends ComparisonBase<FormulaData> {

	@ViewChild( 'formulaTypeDropdown' )
	private _formulaTypeDropdown: CUBDropdownComponent;
	@ViewChild( 'subComparison' )
	public subComparison: ComparisonBase;

	@Input() @CoerceArray()
	public fields: Field[];
	@Input() public field: FormulaField;

	protected readonly ERROR_MODE: typeof CUBFormFieldDisplayErrorMode
		= CUBFormFieldDisplayErrorMode;
	protected readonly comparisonOperators: TComparisonOperator[]; // don't use
	protected readonly formulaType: typeof FormulaType
		= FormulaType;
	protected readonly formulaTypes: TFormulaType[]
		= formulaTypes;
	protected readonly formulaTypeControl: FormControl
		= new FormControl( undefined );

	/**
	 * @param {FormulaType=} formulaType
	 * @return {ComparisonDefault}
	 */
	public static getDefaultOption(
		formulaType: FormulaType = FormulaType.NUMBER
	): FormulaDefault {
		let compareType: ComparisonType;
		let operator: ComparisonOperator;

		switch ( formulaType ) {
			case FormulaType.NUMBER:
				compareType = NumberComparisonComponent.default.compareType;
				operator = NumberComparisonComponent.default.operator;
				break;
		}

		return {
			formulaType,
			compareType,
			operator,
		};
	}

	/**
	 * @return {void}
	 */
	public openFormulaTypeDropdown() {
		setTimeout(
			() => this._formulaTypeDropdown.open()
		);
	}

	/**
	 * @return {void}
	 */
	protected formulaTypeChange() {
		setTimeout(
			() => {
				this.subComparison.openComparisonOperator();
				this.subComparison.resetDataControl();
			}
		);
	}

	/**
	 * @param {FormulaData} e
	 * @return {void}
	 */
	protected onDataChanged( e: FormulaData ) {
		this.data = {
			...e,
			formulaType: this.data.formulaType,
		};

		this.dataChange.emit( this.data );
	}

}
