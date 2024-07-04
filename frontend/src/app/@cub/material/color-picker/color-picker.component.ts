import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';

import {
	ACCENT_COLORS
} from '../../resources';

@Component({
	selector: 'cub-color-picker',
	templateUrl: './color-picker.pug',
	styleUrls: [ './color-picker.scss' ],
	host: { class: 'cub-color-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBColorPickerComponent {

	@Input() public picked: string;

	@Output() public pickedChange: EventEmitter<string>
		= new EventEmitter<string>();

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly ACCENT_COLORS = ACCENT_COLORS;

	/**
	 * @param {string} color
	 * @return {void}
	 */
	protected pickColor( color: string ) {
		this.pickedChange.emit(
			this.picked = color
		);
	}

}
