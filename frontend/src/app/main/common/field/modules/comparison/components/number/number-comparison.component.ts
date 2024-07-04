import {
	ChangeDetectionStrategy,
	Component,
	Input,
	TemplateRef,
	ViewChild
} from '@angular/core';
import {
	FormGroup,
	FormBuilder
} from '@angular/forms';

import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	NumberField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

const operatorHasComparisonType: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.GREATER_THAN,
	ComparisonOperator.GREATER_THAN_OR_EQUAL,
	ComparisonOperator.LESS_THAN,
	ComparisonOperator.LESS_THAN_OR_EQUAL,
]);

const comparisonRange: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_BETWEEN,
	ComparisonOperator.IS_NOT_BETWEEN,
]);

const comparisonEmpty: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
]);

export type NumberData = AdvanceData & {
	// static
	number?: number;

	// range
	start?: number;
	end?: number;
};

@Component({
	selector: 'number-comparison',
	templateUrl: './number-comparison.pug',
	host: { class: 'number-comparison' },
	styleUrls: [ '../../styles/comparison-base.scss' ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberComparisonComponent
	extends ComparisonBase<NumberData> {

	@ViewChild( 'dataInput' )
	private _dataInput: CUBFormFieldInputDirective;
	@ViewChild( 'startDataInput' )
	private _startDataInput: CUBFormFieldInputDirective;
	@ViewChild( 'endDataInput' )
	private _endDataInput: CUBFormFieldInputDirective;

	@Input() public field: NumberField;
	@Input() public formulaTypePicker: TemplateRef<any>;

	public readonly rangeForm: FormGroup
		= this._fb.group({
			start: undefined,
			end: undefined,
		});

	protected readonly comparisonOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EXACTLY,
				'SYMBOL.IS_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EXACTLY,
				'SYMBOL.IS_NOT_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.LESS_THAN,
				'SYMBOL.LESS_THAN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.LESS_THAN_OR_EQUAL,
				'SYMBOL.LESS_THAN_OR_EQUAL'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.GREATER_THAN,
				'SYMBOL.GREATER_THAN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.GREATER_THAN_OR_EQUAL,
				'SYMBOL.GREATER_THAN_OR_EQUAL'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EMPTY,
				'IS_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EMPTY,
				'IS_NOT_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_BETWEEN,
				'IS_BETWEEN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_BETWEEN,
				'IS_NOT_BETWEEN'
			),
		];
	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;
	protected readonly comparisonRange: ReadonlySet<ComparisonOperator>
		= comparisonRange;

	/**
	 * @constructor
	 * @param {FormBuilder} _fb
	 */
	constructor( private _fb: FormBuilder ) {
		super();
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.data = this.operatorHasComparisonType.has( this.operator )
			? {
				compareType: NumberComparisonComponent.default.compareType,
			}
			: comparisonEmpty.has( this.operator )
				? undefined
				: {};

		if ( operatorHasComparisonType.has( this.operator ) ) {
			setTimeout( () => this._dataInput.focus() );
		}

		if ( comparisonRange.has( this.operator ) ) {
			setTimeout( () => this._startDataInput.focus() );
		}

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		type: ComparisonType
	) {
		super.onTypeChange(
			type
		);

		this.data = {
			...this.data,
			number: undefined,
		};

		// switch ( this.data.compareType ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonType.STATIC:
		// 		setTimeout( () => this._dataInput.focus() );
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @return {void}
	 */
	protected onDataChange() {
		this.data.number = this.data.number
			? +this.data.number
			: undefined;

		super.onDataChange();
	}

	/**
	 * @param {boolean=} isStart
	 * @return {void}
	 */
	protected onRangeDataChange( isStart?: boolean ) {
		if ( isStart ) {
			this.data.start = this.data.start
				? +this.data.start
				: undefined;
		} else {
			this.data.end = this.data.end
				? +this.data.end
				: undefined;
		}

		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	protected onStartInputBlur() {
		setTimeout( () => this._endDataInput.focus() );
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorDropdownOpened() {
		this._endDataInput?.blur();
	}

}
