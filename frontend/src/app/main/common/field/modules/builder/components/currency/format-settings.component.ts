import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';

import {
	CURRENCIES
} from '../../../../resources';
import {
	CurrencyDecimalPlaces,
	CurrencyFormat,
	NumberFormat
} from '../../../../interfaces';

type ChangeEvent = {
	currency: string;
	format: CurrencyFormat;
	decimalPlaces: CurrencyDecimalPlaces;
};

@Component({
	selector: 'currency-format-settings',
	templateUrl: './format-settings.pug',
	host: { class: 'currency-format-settings' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFormatSettingsComponent {

	@Input() public currency: string;
	@Input() public format: CurrencyFormat;
	@Input() public decimalPlaces: CurrencyDecimalPlaces;

	@Output() public currencyChange: EventEmitter<string>
		= new EventEmitter<string>();
	@Output() public formatChange: EventEmitter<CurrencyFormat>
		= new EventEmitter<CurrencyFormat>();
	@Output() public decimalPlacesChange: EventEmitter<CurrencyDecimalPlaces>
		= new EventEmitter<CurrencyDecimalPlaces>();
	@Output() public changes: EventEmitter<ChangeEvent>
		= new EventEmitter<ChangeEvent>();

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly CURRENCIES = CURRENCIES;
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
	protected readonly NumberFormat = NumberFormat;

	/**
	 * @return {void}
	 */
	protected onChanges() {
		this.changes.emit({
			currency: this.currency,
			format: this.format,
			decimalPlaces: this.decimalPlaces,
		});
	}

}
