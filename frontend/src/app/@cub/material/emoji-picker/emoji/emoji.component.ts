import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	AliasOf,
	CoerceCssPixel
} from 'angular-core';

@Component({
	selector: 'cub-emoji, [cubEmoji]',
	templateUrl: './emoji.pug',
	styleUrls: [ './emoji.scss' ],
	host: { class: 'cub-emoji' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBEmojiComponent {

	@Input() public emoji: string;
	@HostBinding( 'style.--emoji-size' )
	@Input() @CoerceCssPixel() public size: string;

	@Input( 'cubEmoji' ) @AliasOf( 'emoji' )
	public cubEmoji: string;

}
