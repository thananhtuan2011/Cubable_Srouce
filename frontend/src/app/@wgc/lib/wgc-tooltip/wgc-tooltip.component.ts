import {
	Component, ElementRef, ViewEncapsulation,
	ViewChild, TemplateRef, ChangeDetectorRef,
	Input, ChangeDetectionStrategy, NgZone
} from '@angular/core';

import { DefaultValue, CoerceCssPixel, CoerceBoolean } from '@core';

export type WGCITooltipTheme = 'default' | 'light';
export type WGCITooltipPosition = 'above' | 'below' | 'before' | 'after';
export type WGCITooltipDirection = 'start' | 'end' | 'center';

@Component({
	selector		: 'wgc-tooltip',
	templateUrl		: './wgc-tooltip.pug',
	styleUrls		: [ './wgc-tooltip.scss' ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTooltipComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@Input() public color: string;
	@Input() public backdropClass: string;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public messageOnly: boolean;
	@Input() @DefaultValue() public theme: WGCITooltipTheme = 'default';

	public message: string;
	public close: ( event?: MouseEvent ) => void;
	public classList: ObjectType<boolean> = {};

	private _previousPanelClass: string;

	@Input( 'class' )
	set panelClass( classes: string ) {
		const previousPanelClass: string = this._previousPanelClass;

		previousPanelClass?.split( ' ' ).forEach( ( className: string ) => {
			this.classList[ className ] = false;
		} );

		this._previousPanelClass = classes;

		classes?.split( ' ' ).forEach( ( className: string ) => {
			this.classList[ className ] = true;
		} );

		this._elementRef.nativeElement.className = '';
	}

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {NgZone} _ngZone
	 */
	constructor( private _elementRef: ElementRef, private _cdRef: ChangeDetectorRef, private _ngZone: NgZone ) {}

	/**
	 * @param {WGCITooltipPosition} position
	 * @param {WGCITooltipDirection} direction
	 * @return {void}
	 */
	public setPositionClasses( position: WGCITooltipPosition, direction?: WGCITooltipDirection ) {
		this._ngZone.runGuarded( () => {
			this.classList[ 'wgc-tooltip--above' ] = position === 'above';
			this.classList[ 'wgc-tooltip--below' ] = position === 'below';
			this.classList[ 'wgc-tooltip--before' ] = position === 'before';
			this.classList[ 'wgc-tooltip--after' ] = position === 'after';
			this.classList[ 'wgc-tooltip--dir-start' ] = direction === 'start';
			this.classList[ 'wgc-tooltip--dir-end' ] = direction === 'end';
			this.classList[ 'wgc-tooltip--message-only' ] = this.messageOnly;
			this.classList[ 'wgc-tooltip--light-theme' ] = this.theme === 'light';

			this.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	public reattach() {
		this._cdRef.reattach();
	}

	/**
	 * @return {void}
	 */
	public detach() {
		this._cdRef.detach();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

}
