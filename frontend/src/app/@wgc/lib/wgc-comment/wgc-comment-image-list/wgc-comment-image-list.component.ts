import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import _ from 'lodash';

import { WGCIFile } from '../../wgc-file-picker';

import { WGCICommentImageClickedEvent } from '../interfaces';

@Component({
	selector		: 'wgc-comment-image-list',
	templateUrl		: './wgc-comment-image-list.pug',
	styleUrls		: [ './wgc-comment-image-list.scss' ],
	host			: { class: 'wgc-comment-image-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentImageListComponent {

	@Input() public images: WGCIFile[] = [];

	@Output() public imageClicked: EventEmitter<WGCICommentImageClickedEvent> = new EventEmitter<WGCICommentImageClickedEvent>();

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public emitImageClicked( index: number ) {
		this.imageClicked.emit({ images: _.map( this.images, '@previewUrl' ), clickedIndex: index });
	}

}
