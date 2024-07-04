import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

export type CUBActionItemType = 'default' | 'destructive';

@Component({
	selector: 'button[cubActionItem]',
	templateUrl: './action-item.pug',
	styleUrls: [ './action-item.scss' ],
	host: { class: 'cub-action-item' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBActionItemComponent {

	@Input() @DefaultValue()
	public type: CUBActionItemType = 'default';
	@Input() public icon: string;
	@HostBinding( 'attr.title' )
	@Input() public label: string;
	@HostBinding( 'class.cub-action-item--active' )
	@Input() @CoerceBoolean()
	public active: boolean;

	@HostBinding( 'class' )
	get class(): string {
		return this.type
			? `cub-action-item-${this.type}`
			: undefined;
	}

}
