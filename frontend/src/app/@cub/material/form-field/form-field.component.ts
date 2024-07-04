import {
	AfterContentChecked,
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	EventEmitter,
	HostBinding,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	FormControl,
	FormControlDirective,
	FormControlName,
	FormControlStatus,
	UntypedFormControl,
	ValidationErrors,
	Validators
} from '@angular/forms';
import {
	FocusMonitor,
	FocusOrigin
} from '@angular/cdk/a11y';
import {
	coerceBooleanProperty
} from '@angular/cdk/coercion';
import {
	EMPTY,
	merge,
	Observable,
	Subject
} from 'rxjs';
import {
	filter,
	startWith,
	takeUntil,
	tap
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBTooltipRef,
	CUBTooltipService
} from '../tooltip';
import {
	ExtendedFormControl,
	extendFormControl
} from '../value-accessor';

import {
	CUBFormFieldDisplayDirective
} from './form-field-display.directive';
import {
	CUBFormFieldErrorDirective,
	CUBFormFieldErrorTemplateDirective
} from './form-field-error.directive';
import {
	CUBFormFieldInputDirective
} from './form-field-input.directive';

export enum CUBFormFieldSize {
	Small = 'small',
	Large = 'large',
}

export enum CUBFormFieldVariant {
	Outlined = 'outlined',
	Filled = 'filled',
}

export enum CUBFormFieldDisplayErrorMode {
	Inline = 'inline',
	Tooltip = 'tooltip',
	Off = 'off',
}

@Unsubscriber()
@Component({
	selector: 'cub-form-field',
	templateUrl: './form-field.pug',
	styleUrls: [ './form-field.scss' ],
	host: { class: 'cub-form-field' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFormFieldComponent
implements AfterContentChecked,
	AfterContentInit,
	AfterViewInit,
	OnDestroy,
	OnInit {

	@Input() public tabindex: number = 0;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public helpText: string;
	@Input() public outerClass: string;
	@Input() @DefaultValue()
	public size: CUBFormFieldSize
			= CUBFormFieldSize.Large;
	@Input() @DefaultValue()
	public variant: CUBFormFieldVariant
			= CUBFormFieldVariant.Outlined;
	@Input() @DefaultValue()
	public displayErrorMode: CUBFormFieldDisplayErrorMode
			= CUBFormFieldDisplayErrorMode.Inline;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public active: boolean;
	@Input() @CoerceBoolean()
	public required: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @CoerceBoolean()
	public autoWidth: boolean;
	@Input() @CoerceBoolean()
	public resizable: boolean;
	@Input() @CoerceBoolean()
	public includeOuterSize: boolean;
	@Input() @CoerceBoolean()
	public hideRequiredMarker: boolean;
	@Input() @CoerceBoolean()
	public multiErrors: boolean;

	@Output( 'container.click' )
	public containerClick: EventEmitter<MouseEvent>
			= new EventEmitter<MouseEvent>();
	@Output( 'container.dblclick' )
	public containerDblClick: EventEmitter<MouseEvent>
			= new EventEmitter<MouseEvent>();
	@Output( 'container.keydown' )
	public containerKeydown: EventEmitter<KeyboardEvent>
			= new EventEmitter<KeyboardEvent>();
	@Output( 'container.focus' )
	public containerFocus: EventEmitter<FocusOrigin>
			= new EventEmitter<FocusOrigin>();
	@Output( 'container.blur' )
	public containerBlur: EventEmitter<FocusOrigin>
			= new EventEmitter<FocusOrigin>();

	@ViewChild( 'container', { static: true } )
	public readonly container: ElementRef<HTMLElement>;
	@ViewChild( 'errorTemplate', { static: true } )
	public readonly errorTemplate: TemplateRef<any>;

	@ContentChild( CUBFormFieldDisplayDirective )
	protected readonly formFieldDisplay:
		CUBFormFieldDisplayDirective;

	@ContentChildren( FormControlDirective )
	protected readonly formControls:
		QueryList<FormControlDirective>;
	@ContentChildren( FormControlName )
	protected readonly formControlNames:
		QueryList<FormControlName>;
	@ContentChildren( CUBFormFieldInputDirective )
	protected readonly formFieldInputs:
		QueryList<CUBFormFieldInputDirective>;
	@ContentChildren( CUBFormFieldErrorDirective )
	protected readonly formFieldErrors:
		QueryList<CUBFormFieldErrorDirective>;
	@ContentChildren( CUBFormFieldErrorTemplateDirective )
	protected readonly formFieldErrorTemplates:
		QueryList<CUBFormFieldErrorTemplateDirective>;

	protected readonly stateChange$: Subject<void>
		= new Subject<void>();
	protected readonly focusing$: Subject<boolean>
		= new Subject<boolean>();

	protected hasCustomError: boolean;
	protected errorTemplateMap:
		Map<string, TemplateRef<any>>;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _focusMonitor: FocusMonitor
		= inject( FocusMonitor );
	private readonly _tooltipService: CUBTooltipService
		= inject( CUBTooltipService );

	private _focusing: boolean;
	private _isContainerFocused: boolean;
	private _control: UntypedFormControl;
	private _errorTooltipRef: CUBTooltipRef;

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-form-field--small':
				this.size
					=== CUBFormFieldSize.Small,
			'cub-form-field--large':
				this.size
					=== CUBFormFieldSize.Large,
			'cub-form-field--outlined':
				this.variant
					=== CUBFormFieldVariant.Outlined,
			'cub-form-field--filled':
				this.variant
					=== CUBFormFieldVariant.Filled,
			'cub-form-field--auto-width':
				this.autoWidth,
			'cub-form-field--resizable':
				this.resizable,
			'cub-form-field--valid':
				this.control?.valid,
			'cub-form-field--invalid':
				this.control?.invalid,
			'cub-form-field--dirty':
				this.control?.dirty,
			'cub-form-field--pristine':
				this.control?.pristine,
			'cub-form-field--touched':
				this.control?.touched,
			'cub-form-field--untouched':
				this.control?.untouched,
			'cub-form-field--enabled':
				this.control?.enabled,
			'cub-form-field--active':
				this.active,
			'cub-form-field--focused':
				this.isFocused,
			'cub-form-field--disabled':
				this.isDisabled,
			'cub-form-field--readonly':
				this.formFieldInput?.readonly,
			'cub-form-field--empty':
				this.formFieldInput?.isEmpty,
			'cub-form-field--erroring':
				this.shouldDisplayErrorState,
		};
	}

	@Input()
	get focusing(): boolean {
		return this._focusing;
	}
	set focusing( v: boolean ) {
		this.focusing$.next(
			this._focusing
				= coerceBooleanProperty( v )
		);
	}

	@Input()
	get control(): UntypedFormControl {
		return this._control
			|| this.formFieldInput?.control
			|| this.formControl?.control
			|| this.formControlName?.control;
	}
	set control( c: UntypedFormControl ) {
		this._control = c;
	}

	get formControl(): FormControlDirective {
		return this
		.formControls
		?.first;
	}

	get formControlName(): FormControlName {
		return this
		.formControlNames
		?.first;
	}

	get formFieldInput(): CUBFormFieldInputDirective {
		return this
		.formFieldInputs
		?.first;
	}

	get fieldName(): string {
		return this.formFieldInput?.name
			|| this.label;
	}

	get isSmallSize(): boolean {
		return this.size
			=== CUBFormFieldSize.Small;
	}

	get isLargeSize(): boolean {
		return this.size
			=== CUBFormFieldSize.Large;
	}

	get isFocused(): boolean {
		return this.focusing
			|| this._isContainerFocused
			|| this.formFieldInput?.isFocused;
	}

	get isRequired(): boolean {
		return this.required
			|| !!this.formFieldInput?.required
			|| !!this.control?.hasValidator(
				Validators.required
			);
	}

	get isDisabled(): boolean {
		return this.disabled
			|| this.formFieldInput?.isDisabled
			|| this.control?.disabled;
	}

	get isDisplayErrorByInline(): boolean {
		return this.displayErrorMode
			=== CUBFormFieldDisplayErrorMode.Inline;
	}

	get isDisplayErrorByTooltip(): boolean {
		return this.displayErrorMode
			=== CUBFormFieldDisplayErrorMode.Tooltip;
	}

	get shouldDisplayErrorState(): boolean {
		return this.displayErrorMode
				!== CUBFormFieldDisplayErrorMode.Off
			&& ( this.hasCustomError
				|| ( this.control
					&& this.control.invalid
						&& ( this.control.dirty
							|| this.control.touched
							|| !!( this.control as
								ExtendedFormControl )?.erroring
							|| !this.formFieldInput?.isEmpty ) ) );
	}

	ngOnInit() {
		this
		.stateChange$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			const obs: Observable<any>[] = [
				this.focusing$,
				this.containerFocus,
				this.containerBlur,
				this
				.formFieldErrors
				.changes
				.pipe(
					startWith( this.formFieldErrors ),
					tap((
						errors:
							QueryList<CUBFormFieldErrorDirective>
					) => {
						this.hasCustomError
							= !!errors.find(
								(
									error: CUBFormFieldErrorDirective
								): boolean =>
									error
										instanceof
											CUBFormFieldErrorDirective
							);

						const control: FormControl
							= this.control as FormControl;

						if ( !control ) {
							return;
						}

						if (
							!control.hasValidator(
								this._customValidatorFn
							)
						) {
							control.addValidators(
								this._customValidatorFn
							);
						}

						control.updateValueAndValidity(
							{ emitEvent: false }
						);

						control.setErrors( control.errors );

						this._cdRef.markForCheck();
					})
				),
			];

			if ( this.formFieldInput ) {
				this
				.formFieldInput
				.formField = this;

				obs.push(
					this.formFieldInput.valueWritten$,
					this.formFieldInput.input$,
					this.formFieldInput.focus$
				);
			}

			if ( this.control ) {
				obs.push(
					(
						this
						.control
						.statusChanges as
							Observable<FormControlStatus>
					)
					.pipe(
						startWith( this.control.status )
					),
					this
					.control
					.valueChanges
					.pipe(
						startWith( this.control.value )
					)
				);

				const extendedControl: ExtendedFormControl
					= extendFormControl( this.control );

				if ( extendedControl ) {
					obs.push(
						extendedControl.erroring$
							|| EMPTY
					);
				}
			}

			merge( ...obs )
			.pipe(
				takeUntil( this.stateChange$ ),
				untilCmpDestroyed( this )
			)
			.subscribe(() => {
				if ( this.isDisplayErrorByTooltip ) {
					this.shouldDisplayErrorState
						&& this.isFocused
						? this._openErrorTooltip()
						: this._closeErrorTooltip();
				}

				this._cdRef.markForCheck();
			});
		});
	}

	ngAfterViewInit() {
		this._monitorFocus();

		if ( this.includeOuterSize ) {
			this._wrapOuterBox();
		}

		if ( this.autoFocusOn ) {
			this.focus();
		}
	}

	ngAfterContentInit() {
		this.stateChange$.next();

		merge(
			this
			.formControls
			.changes
			.pipe(
				startWith( this.formControls )
			),
			this
			.formControlNames
			.changes
			.pipe(
				startWith( this.formControlNames )
			),
			this
			.formFieldInputs
			.changes
			.pipe(
				startWith( this.formFieldInputs )
			)
		)
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.stateChange$.next();
		});

		this
		.formFieldErrorTemplates
		.changes
		.pipe(
			startWith( this.formFieldErrorTemplates ),
			untilCmpDestroyed( this )
		)
		.subscribe((
			errors:
				QueryList<CUBFormFieldErrorTemplateDirective>
		) => {
			this.errorTemplateMap
				||= new Map();

			errors.forEach((
				error: CUBFormFieldErrorTemplateDirective
			) => {
				this.errorTemplateMap.set(
					error.key,
					error.templateRef
				);
			});
		});
	}

	ngAfterContentChecked() {
		if ( !this.formFieldInput ) {
			return;
		}

		this.formFieldInput.isAutoWidth
			= this.autoWidth;
	}

	ngOnDestroy() {
		this
		._errorTooltipRef
		?.close();

		this
		._focusMonitor
		.stopMonitoring(
			this
			.container
			.nativeElement
		);
	}

	/**
	 * @return {void}
	 */
	public focus() {
		this.formFieldInput
			? this
			.formFieldInput
			.focus()
			: this
			.container
			.nativeElement
			.focus();
	}

	/**
	 * @return {void}
	 */
	public blur() {
		this.formFieldInput
			? this
			.formFieldInput
			.blur()
			: this
			.container
			.nativeElement
			.blur();
	}

	/**
	 * @return {void}
	 */
	protected onContainerMousemove() {
		if ( !this.isDisplayErrorByTooltip
			|| !this.shouldDisplayErrorState ) {
			return;
		}

		this._openErrorTooltip();
	}

	/**
	 * @return {void}
	 */
	protected onContainerMouseleave() {
		if ( !this.isDisplayErrorByTooltip
			|| !this.shouldDisplayErrorState
			|| this.isFocused ) {
			return;
		}

		this._closeErrorTooltip();
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected onContainerClick(
		e: MouseEvent
	) {
		if ( this.isDisabled ) {
			return;
		}

		this
		.containerClick
		.emit( e );
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected onContainerDblClick(
		e: MouseEvent
	) {
		if ( this.isDisabled ) {
			return;
		}

		this
		.containerDblClick
		.emit( e );
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {void}
	 */
	protected onContainerKeydown(
		e: KeyboardEvent
	) {
		if ( this.isDisabled ) {
			return;
		}

		this
		.containerKeydown
		.emit( e );
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected onClear( e: MouseEvent ) {
		e.stopPropagation();
		e.preventDefault();

		this.formFieldInput.clear();
	}

	/**
	 * @return {void}
	 */
	private _openErrorTooltip() {
		if (
			this
			._errorTooltipRef
			?.isOpened
		) {
			return;
		}

		this._errorTooltipRef
			||= this._tooltipService.open(
				this.container,
				this.errorTemplate,
				undefined,
				{
					position: 'start-above',
					type: 'error',
					disableClose: true,
				}
			);
	}

	/**
	 * @return {void}
	 */
	private _closeErrorTooltip() {
		if (
			!this
			._errorTooltipRef
			?.isOpened
		) {
			return;
		}

		this._errorTooltipRef.close();

		this._errorTooltipRef = null;
	}

	/**
	 * @return {void}
	 */
	private _monitorFocus() {
		this
		._focusMonitor
		.monitor(
			this
			.container
			.nativeElement,
			true
		)
		.pipe(
			filter(
				(): boolean =>
					!this.isDisabled
			),
			untilCmpDestroyed( this )
		)
		.subscribe((
			origin: FocusOrigin
		) => {
			if ( origin !== null ) {
				if ( !this._isContainerFocused ) {
					this._isContainerFocused = true;

					this.formFieldInput?.focus();

					this
					.containerFocus
					.emit( origin );
				}

				return;
			}

			if ( this.focusing ) {
				return;
			}

			this._isContainerFocused = false;

			this
			.containerBlur
			.emit( origin );
		});
	}

	/**
	 * @return {void}
	 */
	private _wrapOuterBox() {
		const { nativeElement }: ElementRef
			= this._elementRef;
		const wrapper: HTMLDivElement
			= document.createElement( 'div' );

		wrapper.style.padding = '3px';

		wrapper.className
			+= this.outerClass;

		nativeElement.replaceWith( wrapper );

		wrapper.appendChild( nativeElement );
	}

	private readonly _customValidatorFn
		= (): ValidationErrors | null => {
			return this.hasCustomError
				? { custom: true }
				: null;
		};

}
