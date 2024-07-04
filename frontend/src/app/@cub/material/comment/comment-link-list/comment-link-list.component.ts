import {
	Component,
	ChangeDetectionStrategy,
	ViewEncapsulation,
	Input
} from '@angular/core';

@Component({
	selector: 'cub-comment-link-list',
	templateUrl: './comment-link-list.pug',
	styleUrls: [ './comment-link-list.scss' ],
	host: { class: 'cub-comment-link-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCommentLinkListComponent {
	@Input() public linkPreviews: ObjectType[] = [];
}
