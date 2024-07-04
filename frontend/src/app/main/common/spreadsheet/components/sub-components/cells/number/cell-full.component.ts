import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';
import _ from 'lodash';

import {
	NumberData,
	NumberFormat
} from '@main/common/field/interfaces';
import {
	NumberField
} from '@main/common/field/objects';

import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'number-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			number-field-cell
			number-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFieldCellFullComponent
	extends FieldCellInputable<NumberData> {

	@Input() public field: NumberField;

	get isPercentFormat(): boolean {
		return this.field.format
			=== NumberFormat.Percent;
	}

	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		let data: NumberData
			= parseFloat( content as string );

		if ( _.isStrictEmpty( data )
			|| _.isNaN( data ) ) {
			data = null;
		} else if ( this.isPercentFormat ) {
			data = data / 100;
		}

		this.save( data );
	}

}
