import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	AttachmentField
} from '@main/common/field/objects';

import {
	ComparisonBase
} from '../../components';
import {
	ComparisonDefault,
	TComparisonOperator
} from '../../interfaces';

@Component({
	selector		: 'attachment-comparison',
	templateUrl		: './attachment-comparison.pug',
	host			: { class: 'attachment-comparison' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AttachmentComparisonComponent
	extends ComparisonBase<undefined> {

	public static default: ComparisonDefault = {
		operator: ComparisonOperator.IS_EMPTY,
	};

	@Input() public field: AttachmentField;

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
