import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewChild
} from '@angular/core';
import {
	FormGroup,
	FormBuilder
} from '@angular/forms';
import _ from 'lodash';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	RatingField
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

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
]);

export type RatingData = AdvanceData & {
	// static
	number?: number;

	// range
	start?: number;
	end?: number;
};

@Component({
	selector: 'rating-comparison',
	templateUrl: './rating-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'rating-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComparisonComponent
	extends ComparisonBase<RatingData> {

	@ViewChild( 'dataDropdown' )
	private _dataDropdown: CUBDropdownComponent;
	@ViewChild( 'startDataDropdown' )
	private _startDataDropdown: CUBDropdownComponent;
	@ViewChild( 'endDataDropdown' )
	private _endDataDropdown: CUBDropdownComponent;

	@Input() public field: RatingField;

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
				ComparisonOperator.GREATER_THAN,
				'SYMBOL.GREATER_THAN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.GREATER_THAN_OR_EQUAL,
				'SYMBOL.GREATER_THAN_OR_EQUAL'
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
			? { compareType: RatingComparisonComponent.default.compareType }
			: comparisonNotCustomValue.has( this.operator )
				? undefined
				: {};

		if ( comparisonRange.has( this.operator ) ) {
			setTimeout( () => this._startDataDropdown.open() );
		}

		if ( operatorHasComparisonType.has( this.operator ) ) {
			setTimeout(
				() => this._dataDropdown.open()
			);
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
		// 		setTimeout(
		// 			() => this._dataDropdown.open()
		// 		);
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
	 * @return {void}
	 */
	protected onStartDataChange() {
		setTimeout(
			() => this._endDataDropdown.open()
		);

		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	protected onStartDropdownBlur() {
		setTimeout(
			() => this._endDataDropdown.open()
		);
	}

	/**
	 * @return {void}
	 */
	protected onEndDataChange() {
		super.onDataChange();
	}

}
