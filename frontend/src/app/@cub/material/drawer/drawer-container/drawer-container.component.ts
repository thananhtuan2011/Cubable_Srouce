import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	HostBinding,
	Input,
	ViewEncapsulation
} from '@angular/core';

import { CoerceBoolean } from 'angular-core';

import { CUBDrawerComponent } from '../drawer/drawer.component';

@Component({
	selector		: 'cub-drawer-container, [cubDrawerContainer]',
	template		: '<ng-content></ng-content>',
	styleUrls		: [ './drawer-container.scss' ],
	host			: { class: 'cub-drawer-container' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBDrawerContainerComponent {

	@HostBinding( 'style.--drawer-width' )
	get styleWidth(): string { return this.drawerComp.width; }

	@HostBinding( 'class.cub-drawer-container--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@ContentChild( CUBDrawerComponent ) public drawerComp: CUBDrawerComponent;

	@Input() @CoerceBoolean() public stretch: boolean;

}
