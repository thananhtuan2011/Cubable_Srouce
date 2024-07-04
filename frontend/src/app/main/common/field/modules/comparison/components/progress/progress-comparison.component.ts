import {
	ChangeDetectionStrategy,
	Component,
	ViewChild,
	Input,
	inject
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
	ProgressField
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

export type ProgressDataCustom = AdvanceData & {
	// static
	number?: number;

	// range
	start?: number;
	end?: number;
};

export type ProgressData = ProgressDataCustom | number;

@Component({
	selector: 'progress-comparison',
	templateUrl: './progress-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'progress-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressComparisonComponent
	extends ComparisonBase<ProgressData> {

	@ViewChild( 'dataInput' )
	private _dataInput: CUBFormFieldInputDirective;
	@ViewChild( 'startDataInput' )
	private _startDataInput: CUBFormFieldInputDirective;
	@ViewChild( 'endDataInput' )
	private _endDataInput: CUBFormFieldInputDirective;

	@Input() public field: ProgressField;

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
	protected readonly fb: FormBuilder
		= inject( FormBuilder );

	public readonly rangeForm: FormGroup = this.fb.group({
		start: undefined,
		end: undefined,
	});

	protected isStartError: boolean;
	protected isEndError: boolean;

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.data = this.operatorHasComparisonType.has( this.operator )
			? {
				compareType: ProgressComparisonComponent.default.compareType,
			}
			: this.comparisonRange.has( this.operator )
				? {
					start: undefined,
					end: undefined,
				}
				: undefined;

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
			...this.data as ProgressDataCustom,
			start: undefined,
			end: undefined,
		};

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @param {string} e
	 * @return {void}
	 */
	protected onDataChange( e: string ) {
		( this.data as ProgressDataCustom ).number = e
			? +e / 100
			: undefined;

		super.onDataChange();
	}

	/**
	 * @param {string} e
	 * @param {boolean=} isStart
	 * @return {void}
	 */
	protected onRangeDataChange( e: string, isStart?: boolean ) {
		const valueChange: number = e
			? +e / 100
			: undefined;
		const data: ProgressDataCustom = this.data as ProgressDataCustom;

		if ( isStart ) {
			data.start = valueChange;
			this.isEndError = false;
			this.isStartError = data.start > valueChange;
		} else {
			data.end = valueChange;
			this.isStartError = false;
			this.isEndError = data.end < valueChange;
		}

		this.data = data;

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
