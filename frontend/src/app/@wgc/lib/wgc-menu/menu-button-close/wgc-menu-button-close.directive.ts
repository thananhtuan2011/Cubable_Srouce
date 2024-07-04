import { Directive, ElementRef, Input, HostListener } from '@angular/core';
import { Subject } from 'rxjs';

import { CoerceBoolean } from '@core';

@Directive({ selector: '[wgcMenuButtonClose]', exportAs: 'wgcMenuButtonClose' })
export class WGCMenuButtonCloseDirective {

	@Input() @CoerceBoolean() public disabled: boolean;

	public clicked$: Subject<Event> = new Subject<Event>();

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: Event ) {
		if ( this.disabled ) return;

		event.stopPropagation();
		this.clicked$.next( event );
	}

}
