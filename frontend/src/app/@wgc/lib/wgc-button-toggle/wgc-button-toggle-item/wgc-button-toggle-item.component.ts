import {
	Component, ViewEncapsulation, Input,
	ElementRef, HostListener, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';
import { Subject } from 'rxjs';

import { CoerceBoolean, CoerceCssPixel, DefaultValue } from '@core';

@Component({
	selector		: 'wgc-button-toggle-item',
	templateUrl		: './wgc-button-toggle-item.pug',
	host			: { class: 'wgc-button-toggle-item' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCButtonToggleItemComponent {

	@HostBinding( 'class.wgc-button-toggle-item--active' )
	get classActive(): boolean { return this.isActive; }

	@HostBinding( 'class.wgc-button-toggle-item--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-button-toggle-item--only-icon' )
	get classOnlyIcon(): boolean { return this.onlyIcon; }

	@Input() public icon: string;
	@Input() @DefaultValue() @CoerceCssPixel() public iconSize: string = '20px';
	@Input() public label: string;
	@Input() @DefaultValue() @CoerceBoolean() public activeState: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public onlyIcon: boolean;

	public clicked$: Subject<Event> = new Subject<Event>();
	public isActive: boolean;

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: Event ) {
		if ( this.disabled ) return;

		this.clicked$.next( event );
	}

}
