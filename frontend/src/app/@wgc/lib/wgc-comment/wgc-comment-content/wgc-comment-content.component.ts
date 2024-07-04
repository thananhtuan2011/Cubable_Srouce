import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';

import { CoerceCssPixel } from '@core';

@Component({
	selector		: 'wgc-comment-content',
	templateUrl		: './wgc-comment-content.pug',
	styleUrls		: [ './wgc-comment-content.scss' ],
	host			: { class: 'wgc-comment-content' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentContentComponent {

	@Input() @CoerceCssPixel() public limitContentHeight: string;
	@Input() public content: string;

}
