import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean
} from 'angular-core';

import type {
	CUBFile
} from '../file/file.component';

@Component({
	selector: 'cub-file-list',
	templateUrl: './file-list.pug',
	styleUrls: [ './file-list.scss' ],
	host: { class: 'cub-file-list' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFileListComponent {

	@Input() public files: CUBFile[];
	@Input() @CoerceBoolean()
	public downloadable: boolean;
	@Input() @CoerceBoolean()
	public renamable: boolean;
	@Input() @CoerceBoolean()
	public removable: boolean;

	@Output() public renamed: EventEmitter<CUBFile>
		= new EventEmitter<CUBFile>();
	@Output() public removed: EventEmitter<CUBFile>
		= new EventEmitter<CUBFile>();

	/**
	 * @param {CUBFile} file
	 * @return {void}
	 */
	protected onFileRenamed(
		file: CUBFile
	) {
		this.renamed.emit( file );
	}

	/**
	 * @param {CUBFile} file
	 * @return {void}
	 */
	protected onFileRemoved(
		file: CUBFile
	) {
		_.pull( this.files, file );

		this.removed.emit( file );
	}

}
