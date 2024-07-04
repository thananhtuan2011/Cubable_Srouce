import {
	Component,
	ChangeDetectionStrategy,
	ViewEncapsulation,
	Input,
	inject
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceNumber
} from '@core';

import {
	CUBFile,
	CUBFilePreviewerService
} from '../../file-picker';
import {
	CUBPopupRef
} from '../../popup';

@Component({
	selector: 'cub-comment-attachment-list',
	templateUrl: './comment-attachment-list.pug',
	styleUrls: [ './comment-attachment-list.scss' ],
	host: { class: 'cub-comment-attachment-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCommentAttachmentListComponent {

	@Input() @CoerceArray()
	public files: CUBFile[] = [];
	@Input() @CoerceNumber()
	public limit: number = 4;

	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );

	private _filePreviewerPopupRef: CUBPopupRef;

	/**
	 * @param {number=} idx
	 * @return {void}
	 */
	protected previewFile(
		idx: number
	) {
		if (
			this._filePreviewerPopupRef?.isOpened
		) {
			return;
		}

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( this.files ),
					previewingIndex:
						idx,
				}
			);
	}

}
