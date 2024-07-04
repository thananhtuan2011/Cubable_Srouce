import {
	ChangeDetectionStrategy,
	Component,
	OnInit
} from '@angular/core';
import _ from 'lodash';

import {
	ValueType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

import {
	CheckboxData
} from '../../../../interfaces';
import {
	CheckboxField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'checkbox-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'checkbox-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			CheckboxFieldInputComponent
		),
	],
})
export class CheckboxFieldInputComponent
	extends FieldInputEditable<CheckboxField, CheckboxData>
	implements OnInit {

	get hasData(): boolean {
		return _.isBoolean( this.data );
	}

	ngOnInit() {
		const data: CheckboxData
			= ( this.data as any )?.valueType
				? ( this.data as any ).data
				: this.data;

		if (
			_.isBoolean( data )
			|| this.readonly
		) return;

		this.onDataChanged(
			false
		);
	}

	/**
	 * @return {void}
	 */
	protected onClick( data: CheckboxData ) {
		if (
			this.readonly
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		this.onDataChanged(
			!data
		);
	}

	/**
	 * @param {KeyboardEvent} e
	 * @param {CheckboxData} data
	 * @return {void}
	 */
	protected onKeydown(
		e: KeyboardEvent,
		data: CheckboxData
	) {
		if ( this.readonly
			|| ( e.code !== 'Enter'
				&& e.code !== 'Space' )
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		e.preventDefault();

		this.onDataChanged(
			!data
		);
	}

}
