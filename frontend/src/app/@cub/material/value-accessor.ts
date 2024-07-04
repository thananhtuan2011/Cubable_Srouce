import {
	Directive,
	ElementRef,
	forwardRef,
	inject,
	Injector,
	Input,
	OnInit,
	Provider
} from '@angular/core';
import {
	DefaultValueAccessor,
	NG_VALUE_ACCESSOR,
	NgControl,
	UntypedFormControl,
	Validators
} from '@angular/forms';
import {
	BehaviorSubject,
	startWith
} from 'rxjs';
import _ from 'lodash';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

export type ExtendedFormControl
	= UntypedFormControl & {
		erroring?: null | boolean;
		erroring$?: BehaviorSubject<null | boolean>;
		markAsErroring?(): void;
	};

export function extendFormControl(
	control: UntypedFormControl
) {
	const c: ExtendedFormControl
		= control as ExtendedFormControl;

	if ( c && c.erroring$ === undefined ) {
		c.erroring$
			= new BehaviorSubject<null | boolean>(
				c.erroring = null
			);
		c.markAsErroring
			= () => {
				c.erroring$.next(
					c.erroring
						= c.errors !== null
				);
			};

		// Override reset method
		const resetFn: typeof control.reset
			= control.reset.bind( control );

		c.reset = (
			value?: any,
			options?: Object
		) => {
			resetFn( value, options );

			c.erroring$.next(
				c.erroring = null
			);
		};
	}

	return c;
}

export const CUB_VALUE_ACCESSOR
	= ( c: any ): Provider => ({
		multi: true,
		provide:
			NG_VALUE_ACCESSOR,
		useExisting:
			forwardRef( () => c ),
	});

@Unsubscriber()
@Directive()
export class CUBValueAccessor<T = any>
	extends DefaultValueAccessor
	implements OnInit {

	@Input() @CoerceBoolean()
	public required: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;

	public control: ExtendedFormControl;

	protected readonly injector: Injector
		= inject( Injector );
	protected readonly elementRef: ElementRef
		= inject( ElementRef );

	private _isRequired: boolean;
	private _isDisabled: boolean;

	get element(): any {
		return this
		.elementRef
		.nativeElement;
	}

	get value(): T {
		return this.element.value;
	}

	get isEmpty(): boolean {
		return _.isStrictEmpty( this.value );
	}

	get isRequired(): boolean {
		return this._isRequired
			|| this.required;
	}

	get isDisabled(): boolean {
		return this._isDisabled
			|| this.disabled
			|| this.control?.disabled;
	}

	ngOnInit() {
		this._injectControl();

		if ( this.control ) {
			return;
		}

		setTimeout(() => {
			this._injectControl();
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onErroringChanges(
		// @ts-ignore
		// eslint-disable-next-line @typescript-eslint/naming-convention
		isErroring: null | boolean
	) {}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override setDisabledState(
		isDisabled: boolean
	) {
		super.setDisabledState(
			this._isDisabled = isDisabled
		);
	}

	/**
	 * @return {void}
	 */
	private _injectControl() {
		this.control = extendFormControl(
			this
			.injector
			.get( NgControl, null )
			?.control as UntypedFormControl
		);

		if ( !this.control ) {
			return;
		}

		this
		.control
		.erroring$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe((
			erroring: boolean
		) => {
			this.onErroringChanges( erroring );
		});

		this
		.control
		.valueChanges
		.pipe(
			startWith( this.control.value ),
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this._isRequired
				= !!this
				.control
				.hasValidator(
					Validators.required
				);
		});
	}

}
