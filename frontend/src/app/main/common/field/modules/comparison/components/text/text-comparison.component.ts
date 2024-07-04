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
	CUBMenuComponent,
	CUBMenuTriggerForDirective
} from '@cub/material/menu';
import {
	CUBFormFieldComponent,
	CUBFormFieldInputDirective
} from '@cub/material/form-field';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	TextField
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
	ComparisonOperator.CONTAINS,
	ComparisonOperator.DOES_NOT_CONTAINS,
]);

const operatorsAllowWordCount: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.WORD_COUNT_GREATER_THAN,
	ComparisonOperator.WORD_COUNT_GREATER_THAN_OR_EQUAL,
	ComparisonOperator.WORD_COUNT_LESS_THAN,
	ComparisonOperator.WORD_COUNT_LESS_THAN_OR_EQUAL,
	ComparisonOperator.WORD_COUNT_EQUAL,
]);

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
	ComparisonOperator.STARTS_WITH,
	ComparisonOperator.ENDS_WITH,
]);

export type TextDataCustom = AdvanceData & {
	// static
	text?: string;
};

export type TextData = TextDataCustom | string | number;

@Component({
	selector: 'text-comparison',
	templateUrl: './text-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'text-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComparisonComponent
	extends ComparisonBase<TextData> {

	@ViewChild( 'operatorMenu' )
	private _operatorMenu: CUBMenuComponent;
	@ViewChild( 'operatorFormField' )
	private _operatorFormField: CUBFormFieldComponent;
	@ViewChild( 'operatorMenuTrigger' )
	private _operatorMenuTrigger: CUBMenuTriggerForDirective;
	@ViewChild( 'textInput' )
	private _textInput: CUBFormFieldInputDirective;
	@ViewChild( 'numberInput' )
	private _numberInput: CUBFormFieldInputDirective;

	@Input() public field: TextField;

	public readonly wordCountControl: FormControl
		= new FormControl( undefined );

	protected readonly comparisonOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EMPTY,
				'IS_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EMPTY,
				'IS_NOT_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EXACTLY,
				'IS_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EXACTLY,
				'IS_NOT_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.CONTAINS,
				'CONTAINS'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.DOES_NOT_CONTAINS,
				'DOES_NOT_CONTAINS'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.STARTS_WITH,
				'STARTS_WITH'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.ENDS_WITH,
				'ENDS_WITH'
			),
		];
	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;
	protected readonly operatorsAllowWordCount: ReadonlySet<ComparisonOperator>
		= operatorsAllowWordCount;
	protected readonly comparisonOperatorsWordCount: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.WORD_COUNT_EQUAL,
				'WORD.EQUAL'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.WORD_COUNT_GREATER_THAN,
				'WORD.GT'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.WORD_COUNT_GREATER_THAN_OR_EQUAL,
				'WORD.GTE'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.WORD_COUNT_LESS_THAN,
				'WORD.LT'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.WORD_COUNT_LESS_THAN_OR_EQUAL,
				'WORD.LTE'
			),
		];

	/**
	 * @param {TComparisonOperator} o
	 * @return {void}
	 */
	protected onWordCountOperatorChange( o: TComparisonOperator ) {
		this.operator = o.value;

		this._operatorMenu.close();
		this.onOperatorChange();
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		this.data = this.operatorHasComparisonType.has( this.operator )
			? { compareType: TextComparisonComponent.default.compareType }
			: comparisonNotCustomValue.has( this.operator )
			|| operatorsAllowWordCount.has( this.operator )
				? undefined
				: {};

		if (
			operatorsAllowWordCount.has( this.operator )
		) {
			setTimeout( () => this._numberInput.focus() );
		}

		// INPUT TEXT FOCUS
		if (
			operatorHasComparisonType.has( this.operator )
		) {
			setTimeout( () => this._textInput.focus() );
		}

		switch ( this.operator ) {
			case ComparisonOperator.STARTS_WITH:
			case ComparisonOperator.ENDS_WITH:
				setTimeout( () => this._textInput.focus() );
				break;
		}

		super.onOperatorChange();
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
			...this.data as TextDataCustom,
			text: undefined,
		};

		// TODO remove
		// switch (
		// 	( this.data as TextDataCustom ).compareType
		// ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonType.STATIC:
		// 		setTimeout( () => this._textInput.focus() );
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @return {void}
	 */
	public override openComparisonOperator() {
		setTimeout(
			() => {
				this._operatorFormField.focus();
				this._operatorMenuTrigger.open();
			},
			10
		);
	}

}
