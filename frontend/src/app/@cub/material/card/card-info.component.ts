import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	DefaultValue,
	CoerceCssPixel
} from 'angular-core';

import {
	CUBIconColor
} from '../icon';

@Component({
	selector: 'cub-card-info',
	templateUrl: './card-info.pug',
	styleUrls: [ './card-info.scss' ],
	host: { class: 'cub-card-info' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCardInfoComponent {

	@Input() public title: string;
	@Input() public description: string;
	@Input() public leadingIcon: string;
	@Input() public leadingIconColor: string | CUBIconColor;
	@Input() @DefaultValue() @CoerceCssPixel()
	public leadingIconSize: string = '24px';
	@Input() public trailingIcon: string;
	@Input() public trailingIconColor: string | CUBIconColor;
	@Input() @DefaultValue() @CoerceCssPixel()
	public trailingIconSize: string = '24px';

}
