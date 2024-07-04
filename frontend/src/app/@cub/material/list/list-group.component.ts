import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector		: 'cub-list-group',
	templateUrl		: './list-group.pug',
	styleUrls		: [ './list-group.scss' ],
	host			: { class: 'cub-list-group' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBListGroupComponent {

	@Input() public label: string;

}
