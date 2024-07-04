import {
	Component, Inject, Input,
	Optional, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';

import { Unsubscriber } from '@core';

import { WGC_FILE_SERVICE, WGCIFileService, WGCIFile, openFile } from '../../wgc-file-picker';

@Unsubscriber()
@Component({
	selector		: 'wgc-comment-attachment-list',
	templateUrl		: './wgc-comment-attachment-list.pug',
	styleUrls		: [ './wgc-comment-attachment-list.scss' ],
	host			: { class: 'wgc-comment-attachment-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentAttachmentListComponent {

	@Input() public attachments: WGCIFile[] = [];

	/**
	 * @constructor
	 * @param {WGCIFileService} _fileService
	 */
	constructor( @Optional() @Inject( WGC_FILE_SERVICE ) private _fileService: WGCIFileService ) {}

	/**
	 * @param {WGCIFile} file
	 * @return {void}
	 */
	public openFile( file: WGCIFile ) {
		openFile( file ) || this._fileService?.downloadLocalFile( file );
	}

}
