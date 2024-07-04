import {
	Component,
	ChangeDetectionStrategy,
	ViewEncapsulation,
	Input
} from '@angular/core';

import {
	CUBBasicEditorContent
} from '../../editor';

@Component({
	selector: 'cub-comment-content',
	templateUrl: './comment-content.pug',
	styleUrls: [ './comment-content.scss' ],
	host: { class: 'cub-comment-content' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCommentContentComponent {
	@Input() public content: CUBBasicEditorContent;

}
