import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewChild
} from '@angular/core';

import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	EmailField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

const operatorHasComparisonType: ReadonlySet<ComparisonOperator> = new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.CONTAINS,
	ComparisonOperator.DOES_NOT_CONTAINS,
]);

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator> = new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
	ComparisonOperator.STARTS_WITH,
	ComparisonOperator.ENDS_WITH,
]);

const operatorsTextValue: ReadonlySet<ComparisonOperator> = new Set([
	ComparisonOperator.CONTAINS,
	ComparisonOperator.DOES_NOT_CONTAINS,
]);

export type EmailCustomData = AdvanceData & {
	// static
	text?: string;
};

export type EmailData = EmailCustomData | string;

@Component({
	selector: 'email-comparison',
	templateUrl: './email-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'email-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailComparisonComponent
	extends ComparisonBase<EmailData> {

	@ViewChild( 'textInput' )
	private _textInput: CUBFormFieldInputDirective;
	@ViewChild( 'emailInput' )
	private _emailInput: CUBFormFieldInputDirective;

	@Input() public field: EmailField;

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
	protected readonly operatorsTextValue: ReadonlySet<ComparisonOperator>
		= operatorsTextValue;

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.data = this.operatorHasComparisonType.has( this.operator )
			? { compareType: EmailComparisonComponent.default.compareType }
			: comparisonNotCustomValue.has( this.operator )
				? undefined
				: {};

		if ( operatorHasComparisonType.has( this.operator ) ) {
			setTimeout( () => this._emailInput.focus() );
		}

		switch ( this.operator ) {
			case ComparisonOperator.STARTS_WITH:
			case ComparisonOperator.ENDS_WITH:
				setTimeout( () => this._textInput.focus() );
				break;
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
			...this.data as EmailCustomData,
			text: undefined,
		};

		// switch ( ( this.data as EmailCustomData ).compareType ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonType.STATIC:
		// 		switch ( this.operator ) {
		// 			case ComparisonOperator.CONTAINS:
		// 			case ComparisonOperator.DOES_NOT_CONTAINS:
		// 				setTimeout( () => this._textInput.focus() );
		// 				break;
		// 			case ComparisonOperator.IS_EXACTLY:
		// 			case ComparisonOperator.IS_NOT_EXACTLY:
		// 				setTimeout( () => this._emailInput.focus() );
		// 				break;
		// 		}
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

}
