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
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuConfig,
	CUBMenuRef,
	CUBMenuService
} from '../../menu';

import {
	CUBTime,
	CUBTimeMenuComponent
} from './time-menu.component';

@Unsubscriber()
@Directive({
	selector: '[cubTimePicker]',
	exportAs: 'cubTimePicker',
})
export class CUBTimePickerDirective {

	@Input( 'cubTimePickerDisableOpen' )
	@CoerceBoolean()
	public disableOpen: boolean;

	@Output( 'timePickerOpened' )
	public opened: EventEmitter<void>
			= new EventEmitter<void>();
	@Output( 'timePickerClosed' )
	public closed: EventEmitter<void>
			= new EventEmitter<void>();
	@Output( 'timePicked' )
	public picked: EventEmitter<CUBTime>
			= new EventEmitter<CUBTime>();

	public origin: ElementRef;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _menuRef: CUBMenuRef<CUBTimeMenuComponent>;

	get isOpened(): boolean {
		return !!this
		._menuRef
		?.isOpened;
	}

	@HostListener( 'click' )
	protected onClick() {
		if ( this.disableOpen ) {
			return;
		}

		this.open();
	}

	/**
	 * @param {CUBMenuConfig=} config
	 * @return {void}
	 */
	public open(
		config?: CUBMenuConfig
	) {
		if ( this.isOpened ) {
			return;
		}

		this._menuRef
			= this._menuService.open(
				this.origin
					|| this._elementRef,
				CUBTimeMenuComponent,
				undefined,
				config
			);

		this
		._menuRef
		.afterOpened()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.opened.emit();

			const {
				instance,
			}: CUBMenuRef<CUBTimeMenuComponent>
				= this._menuRef;

			instance
			.picked
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(
				( time: CUBTime ) => {
					this.picked.emit( time );

					this.close();
				}
			);
		});

		this
		._menuRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.closed.emit();
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) {
			return;
		}

		this._menuRef.close();
	}

}
