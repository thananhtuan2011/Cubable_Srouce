import {
	ChangeDetectionStrategy,
	Component,
	Input
} from '@angular/core';

import {
	CUBCountryCode,
	CUBPhoneCountry
} from '@cub/material/phone-field';

import {
	PhoneData
} from '@main/common/field/interfaces';
import {
	PhoneField
} from '@main/common/field/objects';

import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'phone-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
		'./cell.scss',
	],
	host: {
		class: `
			phone-field-cell
			phone-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhoneFieldCellFullComponent
	extends FieldCellInputable<PhoneData> {

	@Input() public field: PhoneField;

	protected isShowPhoneCountryPicker: boolean;

	private _tempCountryCode: CUBCountryCode;

	get currentCountryCode(): CUBCountryCode {
		return this.data?.countryCode !== undefined
			? this.data.countryCode
			: this.field.countryCode;
	}

	protected override onInput() {
		this.isShowPhoneCountryPicker = true;
	}

	/**
	 * @param {InputBoxContent} content
	 * @return {void}
	 */
	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		content = content as string;

		let data: PhoneData = null;

		if ( content.length ) {
			data = this.data
				|| {} as PhoneData;

			data.phone = content;

			if ( this._tempCountryCode ) {
				data.countryCode
					= this._tempCountryCode;

				this._tempCountryCode = null;
			} else if (
				data.countryCode === undefined
			) {
				data.countryCode
					= this.field.countryCode;
			}
		}

		this.save( data );
	}

	/**
	 * @param {CUBPhoneCountry} phoneCountry
	 * @return {void}
	 */
	protected onPhoneCountryPicked(
		phoneCountry: CUBPhoneCountry
	) {
		if ( !this.data ) {
			this._tempCountryCode
				= phoneCountry.code;
			return;
		}

		this.data.countryCode
			= phoneCountry.code;

		this.save();
	}

	/**
	 * @return {void}
	 */
	protected onPhoneCountryClosed() {
		this.input();
	}

}
