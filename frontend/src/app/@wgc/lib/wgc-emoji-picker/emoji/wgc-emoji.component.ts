import {
	Component, Input, ViewEncapsulation,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceCssPixel } from '@core';

@Component({
	selector		: 'wgc-emoji, [wgcEmoji]',
	templateUrl		: './wgc-emoji.pug',
	styleUrls		: [ './wgc-emoji.scss' ],
	host			: { class: 'wgc-emoji' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCEmojiComponent {

	@HostBinding( 'style.--emoji-size' )
	get styleSize(): string { return this.size; }

	@Input() public emoji: string;
	@Input() @CoerceCssPixel() public size: string;

}
