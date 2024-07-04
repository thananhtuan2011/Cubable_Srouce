import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	ParagraphField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	ComparisonDefault,
	TComparisonOperator
} from '../../interfaces';

@Component({
	selector		: 'paragraph-comparison',
	templateUrl		: './paragraph-comparison.pug',
	host			: { class: 'paragraph-comparison' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ParagraphComparisonComponent
	extends ComparisonBase<undefined> {

	public static default: ComparisonDefault = {
		operator: ComparisonOperator.IS_EMPTY,
	};

	@Input() public field: ParagraphField;

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
		];

}
