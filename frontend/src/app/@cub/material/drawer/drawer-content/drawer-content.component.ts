import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector		: 'cub-drawer-content, [cubDrawerContent]',
	template		: '<ng-content></ng-content>',
	styleUrls		: [ './drawer-content.scss' ],
	host			: { class: 'cub-drawer-content' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBDrawerContentComponent {}
