import {
	Directive
} from '@angular/core';

import {
	CUBFormFieldErrorDirective
} from '../../form-field';

@Directive({
	selector: '[cubDropdownError]',
	exportAs: 'cubDropdownError',
})
export class CUBDropdownErrorDirective
	extends CUBFormFieldErrorDirective {}
