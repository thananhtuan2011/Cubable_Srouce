import {
	Directive,
	HostBinding
} from '@angular/core';

import {
	Field
} from '../../../objects';

import {
	FieldInput,
	IFieldInput
} from './input';

export interface IFieldInputReadonly<F = Field, D = any>
	extends IFieldInput<F, D> {}

@Directive()
export class FieldInputReadonly<F = Field, D = any>
	extends FieldInput<F, D> {

	@HostBinding( 'class.field-input-readonly' )
	protected readonly hostClass: boolean = true;

}
