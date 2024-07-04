import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'wgc-comment-link-list',
	templateUrl		: './wgc-comment-link-list.pug',
	styleUrls		: [ './wgc-comment-link-list.scss' ],
	host			: { class: 'wgc-comment-link-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentLinkListComponent {

	@Input() public linkPreviews: ObjectType[] = [];

}
