import {
	ChangeDetectionStrategy,
	Component,
	HostListener
} from '@angular/core';

import {
	CheckboxData
} from '@main/common/field/interfaces';

import {
	FieldCellEditable
} from '../field-cell-editable';

@Component({
	selector: 'checkbox-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'./cell.scss',
	],
	host: {
		class: `
			checkbox-field-cell
			checkbox-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldCellFullComponent
	extends FieldCellEditable<CheckboxData> {

	protected override onTouch() {
		this._toggle();
	}

	@HostListener( 'keydown.space' )
	protected onKeydownSpace() {
		this._toggle();
	}

	private _toggle() {
		if ( this.readonly ) {
			return;
		}

		this.save( !this.data );
	}

}
