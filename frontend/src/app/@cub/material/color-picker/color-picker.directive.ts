import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuRef,
	CUBMenuService
} from '../menu';

import {
	CUBColorPickerComponent
} from './color-picker.component';

@Unsubscriber()
@Directive({
	selector: '[cubColorPicker]',
	exportAs: 'cubColorPicker',
})
export class CUBColorPickerDirective {

	@Input( 'cubColorPickerDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubColorPickerCloseAfterPicked' ) @DefaultValue() @CoerceBoolean()
	public closeAfterPicked: boolean = true;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public picked: EventEmitter<string>
		= new EventEmitter<string>();
	@Output( 'cubColorPickerChange' ) public pickedColorChange: EventEmitter<string>
		= new EventEmitter<string>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _menuRef: CUBMenuRef<CUBColorPickerComponent>;
	private _pickedColor: string;

	get isOpened(): boolean {
		return !!this._menuRef?.isOpened;
	}

	@Input( 'cubColorPicker' )
	get pickedColor(): string {
		return this._pickedColor;
	}
	set pickedColor( color: string ) {
		this._pickedColor = color;

		if ( !this._menuRef ) return;

		this._menuRef.instance.picked = color;
	}

	@HostListener( 'click' )
	protected onClick() {
		if ( this.disableOpen ) return;

		this.open();
	}

	/**
	 * @return {void}
	 */
	public open() {
		if ( this.isOpened ) return;

		this._menuRef = this._menuService.open(
			this._elementRef,
			CUBColorPickerComponent
		);

		this._menuRef
		.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.opened.emit();

			const { instance }: CUBMenuRef<CUBColorPickerComponent>
				= this._menuRef;

			instance.picked = this.pickedColor;

			instance.pickedChange
			.pipe( untilCmpDestroyed( this ) )
			.subscribe(( color: string ) => {
				this.pickedColorChange.emit(
					this.pickedColor = color
				);

				if ( !this.closeAfterPicked ) return;

				this.close();
			});
		});

		this._menuRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.closed.emit();
			this.picked.emit( this.pickedColor );
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) return;

		this._menuRef.close();
	}

}
