import {
	Component, ContentChild, ContentChildren,
	EventEmitter, HostListener, Input,
	OnDestroy, Output, QueryList,
	ViewEncapsulation, ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceBoolean, DefaultValue } from '@core';
import { WGCActionBoxEndComponent } from '../action-box-end/wgc-action-box-end.component';
import { WGCActionBoxMiddleComponent } from '../action-box-middle/wgc-action-box-middle.component';
import { WGCActionBoxStartComponent } from '../action-box-start/wgc-action-box-start.component';
import { WGCActionItemComponent } from '../action-item/wgc-action-item.component';

export type WGCIActionBoxPosition = 'top' | 'bottom';

@Component({
	selector		: 'wgc-action-box',
	templateUrl		: './wgc-action-box.pug',
	styleUrls		: [ './wgc-action-box.scss' ],
	host			: { class: 'wgc-action-box' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCActionBoxComponent implements OnDestroy {

	@HostBinding( 'class.wgc-action-box--visible' )
	get classVisible(): boolean { return this.visible; }

	@HostBinding( 'class.wgc-action-box--top' )
	get classTop(): boolean { return this.position === 'top'; }

	@HostBinding( 'class.wgc-action-box--bottom' )
	get classBottom(): boolean { return this.position === 'bottom'; }

	@ContentChild( WGCActionBoxStartComponent ) public actionBoxStart: WGCActionBoxStartComponent;
	@ContentChild( WGCActionBoxMiddleComponent ) public actionBoxMiddle: WGCActionBoxMiddleComponent;
	@ContentChild( WGCActionBoxEndComponent ) public actionBoxEnd: WGCActionBoxEndComponent;
	@ContentChildren( WGCActionItemComponent, { descendants: true } ) public actionItems: QueryList<WGCActionItemComponent>;

	@Input() @DefaultValue() @CoerceBoolean() public visible: boolean = false;
	@Input() @DefaultValue() @CoerceBoolean() public autoClose: boolean = true;
	@Input() @DefaultValue() public position: WGCIActionBoxPosition = 'top';

	@Output() public dismissed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@HostListener( 'window:keydown.esc', [ '$event' ] )
	public triggerKeyDownEsc( event: Event ) {
		this.autoClose && this.dismiss( event );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this.dismiss();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public dismiss( event?: Event ) {
		if ( !this.visible ) return;

		this.visible = false;

		this.visibleChange.emit( this.visible );
		this.dismissed.emit( event );
	}

}
