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
	PhoneField
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

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
	ComparisonOperator.STARTS_WITH,
	ComparisonOperator.ENDS_WITH,
]);

export type PhoneDataCustom = AdvanceData & {
	// static
	text?: string;
};

export type PhoneData = PhoneDataCustom | string;

@Component({
	selector: 'phone-comparison',
	templateUrl: './phone-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'phone-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneComparisonComponent
	extends ComparisonBase<PhoneData> {

	@ViewChild( 'numberInput' )
	private _numberInput: CUBFormFieldInputDirective;

	@Input() public field: PhoneField;

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

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		this.data = this.operatorHasComparisonType.has( this.operator )
			? { compareType: PhoneComparisonComponent.default.compareType }
			: comparisonNotCustomValue.has( this.operator )
				? undefined
				: {};

		switch ( this.operator ) {
			case ComparisonOperator.STARTS_WITH:
			case ComparisonOperator.ENDS_WITH:
				setTimeout( () => this._numberInput.focus() );
				break;
		}

		if ( operatorHasComparisonType.has( this.operator ) ) {
			setTimeout( () => this._numberInput.focus() );
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
			...this.data as PhoneDataCustom,
			text: undefined,
		};

		// switch ( ( this.data as PhoneDataCustom ).compareType ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonType.STATIC:
		// 		setTimeout( () => this._numberInput.focus() );
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

}
