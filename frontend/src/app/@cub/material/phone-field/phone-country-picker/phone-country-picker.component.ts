import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	CoerceCssPixel,
	DefaultValue
} from 'angular-core';

import {
	CUBPhoneCountryPicker
} from './phone-country-picker';

export type CUBPhoneCountryPreviewSize
	= 'small' | 'large';

@Component({
	selector: 'cub-phone-country-picker',
	templateUrl: './phone-country-picker.pug',
	styleUrls: [ './phone-country-picker.scss' ],
	host: { class: 'cub-phone-country-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBPhoneCountryPickerComponent
	extends CUBPhoneCountryPicker {

	@Input() @DefaultValue() @CoerceCssPixel()
	public flagSize: string = '20px';
	@Input() @CoerceBoolean()
	public flagOnly: boolean;

	get previewFlagSize(): string {
		return this.flagSize;
	}

}
