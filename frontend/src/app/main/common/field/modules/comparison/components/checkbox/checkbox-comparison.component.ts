import {
	ChangeDetectionStrategy,
	Component,
	OnChanges,
	Input,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	CheckboxField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

const comparisonEmpty: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
]);

const operatorHasComparisonType: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
]);

export type CheckboxData = AdvanceData & {
	// static
	checkbox?: boolean;
};

@Component({
	selector: 'checkbox-comparison',
	templateUrl: './checkbox-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'checkbox-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComparisonComponent
	extends ComparisonBase<CheckboxData>
	implements OnChanges {

	@Input() public field: CheckboxField;

	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;
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
		];

	ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if (
			changes.data?.currentValue
			&& !_.has( changes.data?.currentValue, 'checkbox' )
			&& changes.data?.currentValue?.compareType
				=== ComparisonType.STATIC
		) {
			this.data.checkbox = false;
		}
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		if ( comparisonEmpty.has( this.operator ) ) {
			this.data = undefined;
		} else {
			this.data = {
				compareType: CheckboxComparisonComponent.default.compareType,
				checkbox: false,
			};
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
			checkbox: this.data.compareType === ComparisonType.STATIC
				? false
				: undefined,
		};

		// switch ( this.data.compareType ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

}
