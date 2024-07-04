import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation
} from '@angular/core';

import {
	CUBScrollBar
} from './scroll-bar';

@Component({
	selector: 'cub-scroll-bar',
	template: '<ng-content></ng-content>',
	host: { class: 'cub-scroll-bar' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBScrollBarComponent
	extends CUBScrollBar {}
