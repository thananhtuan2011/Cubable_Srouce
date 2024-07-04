import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	forwardRef,
	HostBinding,
	inject,
	Input,
	OnChanges,
	Provider,
	SimpleChanges
} from '@angular/core';

import {
	CoerceBoolean
} from '@core';

import {
	CUBFormFieldSize,
	CUBFormFieldVariant
} from '@cub/material/form-field';

import {
	Field
} from '../../../objects';

export interface IFieldInput<F = Field, D = any> {
	field: F;
	data: D;
	label: string;
	placeholder: string;
	autoFocusOn: boolean;
	disabled: boolean;
	size: CUBFormFieldSize;
	variant: CUBFormFieldVariant;
}

export type FieldInputType<F = Field, D = any>
	= IFieldInput<F, D>;

export const FIELD_INPUT_FORWARD_REF
	= ( c: any ): Provider => ({
		multi: true,
		provide: FieldInput,
		useExisting:
			forwardRef( () => c ),
	});

@Directive()
export class FieldInput<F = Field, D = any>
implements IFieldInput<F, D>, OnChanges {

	@Input() public field:
		FieldInputType<F, D>[ 'field' ];
	@Input() public data:
		FieldInputType<F, D>[ 'data' ];
	@Input() public label:
		FieldInputType[ 'label' ];
	@Input() public placeholder:
		FieldInputType[ 'placeholder' ];
	@Input() @CoerceBoolean()
	public autoFocusOn:
		FieldInputType[ 'autoFocusOn' ];
	@Input() @CoerceBoolean()
	public disabled:
		FieldInputType[ 'disabled' ];
	@Input() public size:
		FieldInputType[ 'size' ];
	@Input() public variant:
		FieldInputType[ 'variant' ];

	@HostBinding( 'class.field-input' )
	protected readonly hostClass: boolean = true;
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly elementRef: ElementRef
		= inject( ElementRef );

	get innerLabel(): string {
		return this.label === undefined
			? ( this.field as Field ).name
			: this.label;
	}

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( changes.data ) {
			this.onDataChanges(
				this.data
			);
		}
	}

	/**
	 * @param {D} _d
	 * @return {void}
	 */
	protected onDataChanges( _d: D ) {}

}
