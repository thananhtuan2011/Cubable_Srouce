import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	RatingField
} from '@main/common/field/objects';
import {
	RatingData
} from '@main/common/field/interfaces';

import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'rating-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			rating-field-cell
			rating-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingFieldCellFullComponent
	extends FieldCellInputable<RatingData> {

	@Input() public field: RatingField;

	/**
	 * @param {InputBoxContent} content
	 * @return {void}
	 */
	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		if ( !this.data && !content ) {
			return;
		}

		this.save(
			( content as RatingData ) || null
		);
	}

}
