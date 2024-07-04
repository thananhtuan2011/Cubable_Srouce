import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Output,
	Input
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';

import {
	Field
} from '@main/common/field/interfaces';

import {
	CoerceArray,
	Unsubscriber
} from '@core';

@Unsubscriber()
@Component({
	selector: 'field-picker',
	templateUrl: 'field-picker.pug',
	host: { class: 'field-picker' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPickerComponent {

	protected readonly fieldControl: FormControl
		= new FormControl( undefined );

	@Input() @CoerceArray()
	public fields: Field[];
	@Input() public fieldID: ULID;

	@Output() public fieldIDChange: EventEmitter<ULID>
		= new EventEmitter<ULID>();

	/**
	 * @return {void}
	 */
	protected comparisonFieldChange() {
		this.fieldIDChange.emit( this.fieldID );
	}

}
