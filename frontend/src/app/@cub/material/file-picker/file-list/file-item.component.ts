import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Host,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBFile
} from '../file/file.component';

import {
	CUBFileListComponent
} from './file-list.component';

@Component({
	selector: 'cub-file-item',
	templateUrl: './file-item.pug',
	styleUrls: [ './file-item.scss' ],
	host: { class: 'cub-file-item' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFileItemComponent {

	@Input() public file: CUBFile;
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

	protected name: string;
	protected isRenaming: boolean;

	/**
	 * @constructor
	 * @param {CUBFileListComponent} list
	 */
	constructor(
		@Host() protected list: CUBFileListComponent
	) {}

	/**
	 * @param {string} name
	 * @param {string} ext
	 * @return {void}
	 */
	protected onRenamed(
		name: string,
		ext: string
	) {
		this.isRenaming = false;
		this.name = null;

		if ( !name.length ) {
			return;
		}

		let filename: string = name;

		if ( ext.length ) {
			filename += `.${ext}`;
		}

		this.renamed.emit(
			this.file = {
				...this.file,
				filename,
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected rename( name: string ) {
		this.isRenaming = true;
		this.name = name;
	}

	/**
	 * @return {void}
	 */
	protected remove() {
		_.pull(
			this.list.files,
			this.file
		);

		this.removed.emit( this.file );
	}

}
