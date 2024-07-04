import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector: 'cub-card-header',
	template: '<ng-content></ng-content>',
	styleUrls: [ './card-header.scss' ],
	host: { class: 'cub-card-header' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCardHeaderComponent {}
