import {
	ChangeDetectionStrategy,
	Component,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector: 'cub-card-content',
	template: '<ng-content></ng-content>',
	styleUrls: [ './card-content.scss' ],
	host: { class: 'cub-card-content' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCardContentComponent {}
