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
	ValueType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

import {
	RatingData
} from '../../../../interfaces';
import {
	RatingField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'rating-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'rating-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			RatingFieldInputComponent
		),
	],
})
export class RatingFieldInputComponent
	extends FieldInputEditable<RatingField, RatingData> {

	@ViewChild( CUBFormFieldComponent, { static: true } )
	protected readonly formField: CUBFormFieldComponent;

	protected point: number;
	protected isInputting: boolean;

	/**
	 * @param {MouseEvent} _e
	 * @return {void}
	 */
	protected onDblClick(
		_e: MouseEvent,
		_data: RatingData
	) {
		if ( this.readonly ) {
			return;
		}

		this.isInputting = true;

		this.point = _data;
	}

	/**
	 * @return {KeyboardEvent} e
	 */
	protected onKeydown(
		e: KeyboardEvent,
		_data: RatingData
	) {
		if (
			this.readonly
			|| (
				( _data as any )?.valueType
				&& ( _data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		if ( e.code === 'Enter' ) {
			this.onBlur( _data );

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
		this.point = num;
	}

	/**
	 * @return {void}
	 */
	protected onBlur( _data: RatingData ) {
		if (
			this.formControl.invalid
			|| (
				( _data as any )?.valueType
				&& ( _data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		this.isInputting = false;

		const data: RatingData
			= parseFloat(
				this.point as
					unknown as
						string
			) as RatingData;

		if ( !_.isInteger( data ) ) {
			return;
		}

		this.onDataChanged(
			data
		);
	}

}
