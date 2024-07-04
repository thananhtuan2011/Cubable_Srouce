import {
	Directive,
	HostBinding
} from '@angular/core';

import {
	FieldCell
} from './field-cell';

@Directive()
export class FieldCellLite<T = any>
	extends FieldCell<T> {

	@HostBinding( 'class.field-cell-lite' )
	protected readonly hostClass: boolean = true;

}
