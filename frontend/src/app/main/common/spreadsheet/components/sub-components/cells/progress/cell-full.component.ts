import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	ProgressField
} from '@main/common/field/objects';
import {
	ProgressData
} from '@main/common/field/interfaces';

import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'progress-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			progress-field-cell
			progress-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressFieldCellFullComponent
	extends FieldCellInputable<ProgressData> {

	@Input() public field: ProgressField;

	protected slidingPercent: number;

	/**
	 * @param {InputBoxContent} content
	 * @return {void}
	 */
	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		content = content as ProgressData;

		this.save( content / 100 );
	}

}
