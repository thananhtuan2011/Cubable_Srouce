import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	HostListener,
	Input,
	ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';

import {
	AliasOf,
	CoerceBoolean,
	CoerceCssPixel
} from 'angular-core';

@Component({
	selector		: 'button[cubButtonToggleItem]',
	templateUrl		: './button-toggle-item.pug',
	styleUrls		: [ './button-toggle-item.scss' ],
	host			: { class: 'cub-button-toggle-item' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBButtonToggleItemComponent {

	@HostBinding( 'class.cub-button-toggle-item--active' )
	get classActive(): boolean { return this.active; }

	@Input() public leadingIcon: string;
	@Input() @CoerceCssPixel() public leadingIconSize: string;
	@Input() public trailingIcon: string;
	@Input() @CoerceCssPixel() public trailingIconSize: string;
	@Input() @AliasOf( 'leadingIcon' ) public icon: string;
	@Input() @AliasOf( 'leadingIconSize' ) @CoerceCssPixel() public iconSize: string;
	@Input() @CoerceBoolean() public active: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;

	public clicked$: Subject<Event> = new Subject<Event>();

	@HostListener( 'click', [ '$event' ] )
	protected onClick( e: Event ) {
		this.clicked$.next( e );
	}

}
