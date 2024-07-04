import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	HostListener,
	inject,
	Input,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBDropdownSize,
	CUBDropdownVariant
} from '../../dropdown';
import {
	CUBFormFieldComponent,
	CUBFormFieldDisplayErrorMode,
	CUBFormFieldInputDirective
} from '../../form-field';
import {
	CUBMenuComponent,
	CUBMenuRef,
	CUBMenuService,
	CUBMenuType
} from '../../menu';

import {
	CUBPhoneCountryPicker
} from './phone-country-picker';

export type CUBPhoneCountryDropdownSize
	= CUBDropdownSize;
export type CUBPhoneCountryDropdownVariant
	= CUBDropdownVariant;
export type CUBPhoneCountryDisplayErrorMode
	= CUBFormFieldDisplayErrorMode;

@Unsubscriber()
@Component({
	selector: 'cub-phone-country-dropdown',
	templateUrl: './phone-country-dropdown.pug',
	styleUrls: [ './phone-country-picker.scss' ],
	host: {
		class: 'cub-phone-country-picker cub-phone-country-dropdown',
	},
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBPhoneCountryDropdownComponent
	extends CUBPhoneCountryPicker
	implements AfterViewInit {

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;
	@Input() public name: string;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public helpText: string;
	@Input() public size:
		CUBPhoneCountryDropdownSize;
	@Input() public variant:
		CUBPhoneCountryDropdownVariant;
	@Input() public displayErrorMode:
		CUBPhoneCountryDisplayErrorMode;
	@Input() @CoerceBoolean()
	public autoWidth: boolean;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public autoOpen: boolean;
	@Input() @CoerceBoolean()
	public autoReset: boolean;
	@Input() @DefaultValue() @CoerceBoolean()
	public clearable: boolean = true;

	@ViewChild(
		CUBMenuComponent,
		{ static: true }
	)
	protected readonly phoneCountryMenu:
		CUBMenuComponent;
	@ViewChild(
		CUBFormFieldComponent,
		{ static: true }
	)
	protected readonly phoneCountryFormField:
		CUBFormFieldComponent;
	@ViewChild(
		CUBFormFieldInputDirective,
		{ static: true }
	)
	protected readonly phoneCountryInput:
		CUBFormFieldInputDirective;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	get isEmpty(): boolean {
		return !this.countryCode;
	}

	get isOpened(): boolean {
		return this
		.phoneCountryMenu
		.isOpened;
	}

	get canClear(): boolean {
		return this.clearable
			&& !this.disabled
			&& !this.isEmpty;
	}

	get previewFlagSize(): string {
		return this
		.phoneCountryFormField
		.isSmallSize
			? '16px'
			: '20px';
	}

	ngAfterViewInit() {
		if ( !this.autoOpen ) {
			return;
		}

		this.open();
	}

	/**
	 * @return {void}
	 */
	public open() {
		if ( this.disabled
			|| this.readonly
			|| this.isOpened ) {
			return;
		}

		this
		.phoneCountryFormField
		.focus();

		const menuRef: CUBMenuRef
			= this
			._menuService
			.open(
				this
				.phoneCountryFormField
				.container,
				this.phoneCountryMenu,
				undefined,
				{
					type:
						CUBMenuType.FitMenu,
					viewContainerRef:
						this._vcRef,
				}
			);

		menuRef
		.afterOpened()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.opened.emit();

			this._cdRef.markForCheck();
		});

		menuRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.closed.emit();

			this._cdRef.markForCheck();
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		this
		.phoneCountryMenu
		.close();
	}

	/**
	 * @return {void}
	 */
	public clear() {
		this
		.countryCodeChange
		.emit(
			this.phoneCountry
				= this.countryCode
				= null
		);
	}

	@HostListener( 'focus' )
	protected onFocus() {
		this
		.phoneCountryInput
		.focus();
	}

	@HostListener(
		'keydown.space',
		[ '$event' ]
	)
	protected onKeydownSpace(
		e: KeyboardEvent
	) {
		e.preventDefault();

		this.open();
	}

	/**
	 * @return {void}
	 */
	protected onCleared() {
		this.clear();
		this.close();
	}

}
