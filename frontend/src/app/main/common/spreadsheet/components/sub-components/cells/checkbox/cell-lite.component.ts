import {
	ChangeDetectionStrategy,
	Component,
	OnChanges,
	SimpleChanges
} from '@angular/core';

import {
	createCheckboxDOM
} from '@cub/material/checkbox';

import {
	CheckboxData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'checkbox-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [
		'../field-cell.scss',
		'./cell.scss',
	],
	host: {
		class: `
			checkbox-field-cell
			checkbox-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldCellLiteComponent
	extends FieldCellLite<CheckboxData>
	implements OnChanges {

	protected checkboxDOM: string;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.data ) {
			this.checkboxDOM
				= createCheckboxDOM( !!this.data );
		}
	}

}
