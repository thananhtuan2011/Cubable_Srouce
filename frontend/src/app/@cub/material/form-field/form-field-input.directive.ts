import {
	Directive,
	EventEmitter,
	HostBinding,
	HostListener,
	Input,
	OnDestroy,
	Output
} from '@angular/core';
import {
	Subject
} from 'rxjs';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../value-accessor';

import type {
	CUBFormFieldComponent
} from './form-field.component';

@Directive({
	selector: `
		input[cubFormFieldInput],
		textarea[cubFormFieldInput]
	`,
	exportAs: 'cubFormFieldInput',
	providers: [
		CUB_VALUE_ACCESSOR(
			CUBFormFieldInputDirective
		),
	],
})
export class CUBFormFieldInputDirective
	extends CUBValueAccessor
	implements OnDestroy {

	@Input() public name: string;
	@Input() public placeholder: string;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public clearable: boolean = true;

	@Output() public cleared: EventEmitter<void>
		= new EventEmitter<void>();

	public readonly valueWritten$: Subject<string>
		= new Subject();
	public readonly input$: Subject<InputEvent>
		= new Subject();
	public readonly focus$: Subject<FocusEvent>
		= new Subject();

	public isAutoWidth: boolean;
	public isFocused: boolean;
	public formField: CUBFormFieldComponent;

	@HostBinding( 'attr.name' )
	get attrName(): string {
		return this.name || undefined;
	}

	@HostBinding( 'attr.placeholder' )
	get attrPlacholder(): string {
		return this.placeholder || undefined;
	}

	// Fix: prevent native behavior
	@HostBinding( 'attr.maxlength' )
	get attrMaxlength(): string {
		return undefined;
	}

	@HostBinding( 'attr.hiddenArrows' )
	get attrHiddenArrows(): boolean {
		return true;
	}

	@HostBinding( 'attr.size' )
	get attrSize(): boolean {
		return this.isAutoWidth
			? ( this.value
				|| this.placeholder )?.length
			: undefined;
	}

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.isDisabled
			|| undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly
			|| undefined;
	}

	get canClear(): boolean {
		return this.clearable
			&& !this.isDisabled
			&& !this.isEmpty;
	}

	ngOnDestroy() {
		this.valueWritten$.complete();
		this.input$.complete();
		this.focus$.complete();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue(
		value: string,
		emitEvent: boolean = true
	) {
		super.writeValue( value );

		if ( emitEvent ) {
			this
			.valueWritten$
			.next( value );
		}
	}

	/**
	 * @return {void}
	 */
	public click() {
		this
		.elementRef
		.nativeElement
		.click();
	}

	/**
	 * @return {void}
	 */
	public focus() {
		this
		.elementRef
		.nativeElement
		.focus();
	}

	/**
	 * @return {void}
	 */
	public blur() {
		this
		.elementRef
		.nativeElement
		.blur();
	}

	/**
	 * @return {void}
	 */
	public clear() {
		this.writeValue( '' );
		this.onChange( '' );

		this.cleared.emit();
	}

	@HostListener( 'input', [ '$event' ] )
	protected onInput( e: InputEvent ) {
		this.input$.next( e );
	}

	@HostListener( 'focus', [ '$event' ] )
	protected onFocus( e: FocusEvent ) {
		this.isFocused = true;

		this.focus$.next( e );
	}

	@HostListener( 'blur', [ '$event' ] )
	protected onBlur( e: FocusEvent ) {
		this.isFocused = false;

		this.focus$.next( e );
	}

	@HostListener( 'keydown.esc', [ '$event' ] )
	protected onKeydownEsc( e: KeyboardEvent ) {
		// Prevent to close menu/popup/dialog/...
		e.stopPropagation();

		this.canClear
			? this.clear()
			: this.blur();
	}

}
