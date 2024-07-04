import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	EventEmitter,
	HostBinding,
	inject,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceCssPixel,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import { CUBDrawerLazyDirective } from './drawer-lazy.directive';

export type CUBDrawerPosition = 'left' | 'right';

@Component({
	selector		: 'cub-drawer, [cubDrawer]',
	templateUrl		: './drawer.pug',
	styleUrls		: [ './drawer.scss' ],
	host			: { class: 'cub-drawer' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBDrawerComponent implements OnChanges {

	@HostBinding( 'class.cub-drawer-left' )
	get classLeft(): boolean { return this.position === 'left'; }

	@HostBinding( 'class.cub-drawer-right' )
	get classRight(): boolean { return this.position === 'right'; }

	@HostBinding( 'class.cub-drawer--opened' )
	get classOpened(): boolean { return this.opened; }

	@ContentChild( CUBDrawerLazyDirective ) public lazyContent: CUBDrawerLazyDirective;

	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceBoolean() public opened: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public resizable: boolean = true;
	@Input() @DefaultValue() @CoerceNumber() public renderDelay: number = 225;
	@Input() @DefaultValue() public position: CUBDrawerPosition = 'left';

	@Output() public openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() public resized: EventEmitter<number> = new EventEmitter<number>();

	public isRendered: boolean;

	private readonly _cdRef: ChangeDetectorRef = inject( ChangeDetectorRef );

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.opened && this.opened && this._render();
	}

	/**
	 * @param {ResizeEvent} e
	 * @return {void}
	 */
	public onResizing( e: ResizeEvent ) {
		const width: number = e.rectangle.width;

		if ( width < parseFloat( this.minWidth )
			|| width > parseFloat( this.maxWidth ) ) {
			return;
		}

		this.width = width + 'px';
	}

	/**
	 * @param {ResizeEvent} e
	 * @return {void}
	 */
	public onResizeEnd( e: ResizeEvent ) {
		const width: number = e.rectangle.width;

		if ( width < parseFloat( this.minWidth )
			|| width > parseFloat( this.maxWidth ) ) {
			return;
		}

		this.width = width + 'px';

		this.resized.emit( width );
	}

	/**
	 * @return {void}
	 */
	public open() {
		this.openedChange.emit( this.opened = true );

		this._render();
	}

	/**
	 * @return {void}
	 */
	public close() {
		this.openedChange.emit( this.opened = false );
	}

	/**
	 * @return {void}
	 */
	private _render() {
		if ( this.isRendered ) return;

		setTimeout( () => {
			this.isRendered = true;

			this._cdRef.markForCheck();
		}, this.renderDelay );
	}

}
