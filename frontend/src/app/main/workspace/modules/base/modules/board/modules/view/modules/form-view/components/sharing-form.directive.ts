import {
	Directive,
	HostListener,
	ElementRef,
	Input,
	Output,
	EventEmitter,
	inject
} from '@angular/core';
import _ from 'lodash';

import { Unsubscriber, untilCmpDestroyed } from '@core';

import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';
import { CUBOverlayPosition } from '@cub/material/overlay';

import {
	SharingFormComponent,
	SharingFormMenuContext
} from './sharing-form.component';

@Unsubscriber()
@Directive({
	selector: '[sharingForm]',
	exportAs: 'sharingForm',
})
export class SharingFormDirective {

	@Input() public targetElement: ElementRef | HTMLElement;
	@Input() public position: CUBOverlayPosition;
	@Input() public context: SharingFormMenuContext;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _menuRef: CUBMenuRef;

	get isOpened(): boolean {
		return this._menuRef?.isOpened;
	}

	@HostListener( 'click', [ '$event' ] )
	protected onClick( e: MouseEvent | KeyboardEvent ) {
		if ( this._menuRef?.isOpened ) return;

		e.stopPropagation();
		e.preventDefault();

		this._menuRef = this._menuService.open(
			this.targetElement || this._elementRef,
			SharingFormComponent,
			this.context,
			{
				position: this.position,
			}
		);

		this._menuRef
		.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.opened.emit() );

		this._menuRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.closed.emit() );
	}

}
