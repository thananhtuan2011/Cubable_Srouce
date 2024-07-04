import {
	ChangeDetectionStrategy,
	Component,
	ViewChild
} from '@angular/core';
import _ from 'lodash';

import {
	CUBFormFieldComponent
} from '@cub/material/form-field';

import {
	ProgressData
} from '../../../../interfaces';
import {
	ProgressField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'progress-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'progress-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			ProgressFieldInputComponent
		),
	],
})
export class ProgressFieldInputComponent
	extends FieldInputEditable<ProgressField, ProgressData> {

	@ViewChild( CUBFormFieldComponent, { static: true } )
	protected readonly formField: CUBFormFieldComponent;

	protected percent: number;
	protected slidingPercent: number;
	protected isInputting: boolean;

	/**
	 * @param {MouseEvent} _e
	 * @param {ProgressData} _data
	 * @return {void}
	 */
	protected onDblClick(
		_e: MouseEvent,
		_data: ProgressData
	) {
		if (
			this.readonly
			|| ( _data as any )?.valueType
		) {
			return;
		}

		this.isInputting = true;

		this.percent
			= _.toPercent(
				_data
			) as number;
	}

	/**
	 * @param {KeyboardEvent} e
	 * @param {ProgressData} _data
	 * @return {KeyboardEvent} e
	 */
	protected onKeydown(
		e: KeyboardEvent,
		_data: ProgressData
	) {
		if (
			this.readonly
			|| ( _data as any )?.valueType
		) {
			return;
		}

		if ( e.code === 'Enter' ) {
			this.onBlur();

			this
			.formField
			.focus();
			return;
		}

		if ( this.isInputting ) {
			return;
		}

		if ( e.code === 'Backspace' ) {
			this.onDataChanged( null );
			return;
		}

		const num: number
			= parseFloat( e.key );

		if ( !_.isInteger( num ) ) {
			return;
		}

		this.isInputting = true;
		this.percent = num;
	}

	/**
	 * @return {void}
	 */
	protected onBlur() {
		this.isInputting
			= this.formControl.invalid;

		const data: ProgressData
			= (
				parseFloat(
					this.percent as unknown as string
				) / 100
			) as ProgressData;

		if ( !_.isFinite( data )
			|| data < this.field.startValue
			|| data > this.field.endValue ) {
			return;
		}

		this.onDataChanged( data );
	}

}
