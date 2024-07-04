import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';

import {
	NumberDecimalPlaces,
	NumberFormat
} from '../../../../interfaces';

type ChangeEvent = {
	format: NumberFormat;
	decimalPlaces: NumberDecimalPlaces;
};

@Component({
	selector: 'number-format-settings',
	templateUrl: './format-settings.pug',
	host: { class: 'number-format-settings' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFormatSettingsComponent {

	@Input() public format: NumberFormat;
	@Input() public decimalPlaces: NumberDecimalPlaces;

	@Output() public formatChange: EventEmitter<NumberFormat>
		= new EventEmitter<NumberFormat>();
	@Output() public decimalPlacesChange: EventEmitter<NumberDecimalPlaces>
		= new EventEmitter<NumberDecimalPlaces>();
	@Output() public changes: EventEmitter<ChangeEvent>
		= new EventEmitter<ChangeEvent>();

	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
	protected readonly NumberFormat = NumberFormat;

	/**
	 * @return {void}
	 */
	protected onChanges() {
		this.changes.emit({
			format: this.format,
			decimalPlaces: this.decimalPlaces,
		});
	}

}
