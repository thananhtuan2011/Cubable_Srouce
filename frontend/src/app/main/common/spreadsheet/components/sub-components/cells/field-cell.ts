import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	HostBinding,
	inject,
	Input
} from '@angular/core';

import {
	Field
} from '@main/common/field/objects';

export interface IFieldCell<T = any> {
	field: Field;
	data: T;
}

@Directive()
export class FieldCell<T = any> implements IFieldCell<T> {

	@Input() public field: Field;
	@Input() public data: T;
	@Input() public context: ObjectType;

	@HostBinding( 'class.field-cell' )
	protected readonly hostClass: boolean = true;

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly elementRef: ElementRef
		= inject( ElementRef );

	public markAsAttach() {
		this.onAttach();
	}

	public markAsDetach() {
		this.onDetach();
	}

	protected onAttach() {}

	protected onDetach() {}

}
