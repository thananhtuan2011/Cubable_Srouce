import {
	Component, ElementRef, Input,
	ViewEncapsulation, Output, EventEmitter,
	ContentChild, SimpleChanges, OnChanges,
	ChangeDetectorRef, ChangeDetectionStrategy, HostBinding,
	HostListener
} from '@angular/core';
import {
	animate, state, style,
	transition, trigger
} from '@angular/animations';
import _, { DebouncedFunc } from 'lodash';

import { DefaultValue, CoerceBoolean, CoerceNumber, CoerceCssPixel } from '@core';

import { WGCDrawerLazyDirective } from './wgc-drawer-lazy.directive';

export type WGCDrawerPosition = 'left' | 'right';

@Component({
	selector		: 'wgc-drawer, [wgcDrawer]',
	templateUrl		: './wgc-drawer.pug',
	styleUrls		: [ './wgc-drawer.scss' ],
	host			: { class: 'wgc-drawer' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger(
			'slide',
			[
				state( 'closed', style({ width: 0, minWidth: 0, maxWidth: 0, visibility: 'hidden', opacity: 0, overflow: 'hidden' }) ),
				state( 'opened', style({ width: '*', minWidth: '*', maxWidth: '*', visibility: 'visible', opacity: 1, overflow: 'initial' }) ),
				transition( 'opened <=> closed', animate( '225ms cubic-bezier( .4, .0, .2, 1 )' ) ),
			]
		),
	],
})
export class WGCDrawerComponent implements OnChanges {

	@HostBinding( 'style.--drawer-bg-color' )
	get styleBgColor(): string { return this.bgColor; }

	@HostBinding( 'style.--drawer-width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.--drawer-padding-top' )
	get stylePaddingTop(): string { return this.paddingTop || this.paddingVertical; }

	@HostBinding( 'style.--drawer-padding-bottom' )
	get stylePaddingBottom(): string { return this.paddingBottom || this.paddingVertical; }

	@HostBinding( 'style.--drawer-padding-left' )
	get stylePaddingLeft(): string { return this.paddingLeft || this.paddingHorizontal; }

	@HostBinding( 'style.--drawer-padding-right' )
	get stylePaddingRight(): string { return this.paddingRight || this.paddingHorizontal; }

	@HostBinding( 'class.wgc-drawer--left' )
	get classLeft(): boolean { return this.position === 'left'; }

	@HostBinding( 'class.wgc-drawer--right' )
	get classRight(): boolean { return this.position === 'right'; }

	@HostBinding( 'class.wgc-drawer--floating' )
	get classFloating(): boolean { return this.isDrawerFloating; }

	@ContentChild( WGCDrawerLazyDirective ) public lazyContent: WGCDrawerLazyDirective;

	@Input() public label: string;
	@Input() public bgColor: string;
	@Input() @DefaultValue() @CoerceNumber() public renderDelay: number = 225;
	@Input() @CoerceBoolean() public opened: boolean;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public paddingVertical: string;
	@Input() @CoerceCssPixel() public paddingHorizontal: string;
	@Input() @CoerceCssPixel() public paddingTop: string;
	@Input() @CoerceCssPixel() public paddingBottom: string;
	@Input() @CoerceCssPixel() public paddingLeft: string;
	@Input() @CoerceCssPixel() public paddingRight: string;
	@Input() @DefaultValue() public position: WGCDrawerPosition = 'left';

	@Output() public openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	public isSliding: boolean;
	public isRendered: boolean;
	public isHovering: boolean;
	public isDrawerFloating: boolean;

	private _throttleMouseOutEvent: DebouncedFunc<() => void> = _.throttle(
		() => {
			this.isHovering = false;

			setTimeout( () => this.isDrawerFloating = false, 200 );

			this._cdRef.markForCheck();
		},
		300,
		{ leading: false, trailing: true }
	);

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( public elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {}

	@HostListener( 'mouseover', [ '$event' ] )
	public onMouseOver() {
		return;
		this._throttleMouseOutEvent.cancel();

		if ( this.opened || this.isSliding ) return;

		this.isDrawerFloating = true;
		this.isHovering = true;

		this._render();
	}

	@HostListener( 'mouseout', [ '$event' ] )
	public onMouseOut() {
		this._throttleMouseOutEvent();
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.opened && this._render();
	}

	/**
	 * @return {void}
	 */
	public toggle() {
		this.opened = !this.opened;
		this.isDrawerFloating = false;

		this._render();
		this.openedChange.emit( this.opened );
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
