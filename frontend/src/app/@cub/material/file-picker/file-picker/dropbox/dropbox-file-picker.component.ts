import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CUBFile,
	CUBFileSource
} from '../../file/file.component';

import {
	CUBFilePickerInside
} from '../file-picker.inside';

export type CUBDropboxFile = {
	bytes: number;
	icon: string;
	id: string;
	isDir: boolean;
	link: string;
	linkType: string;
	name: string;
	thumbnailLink: string;
};

const IMAGE_EXTENSIONS: string[] = [
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.svg',
];

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Dropbox: any;

@Component({
	selector: 'cub-dropbox-file-picker',
	templateUrl: './dropbox-file-picker.pug',
	styleUrls: [ '../file-picker.inside.scss' ],
	host: { class: 'cub-file-picker-inside cub-dropbox-file-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: CUBFilePickerInside,
			useExisting: forwardRef(
				() => CUBDropboxFilePickerComponent
			),
		},
	],
})
export class CUBDropboxFilePickerComponent
	extends CUBFilePickerInside {

	get extensions(): string[] {
		if ( this.fileAccept ) {
			return this.fileAccept as string[];
		}

		if ( this.imageOnly ) {
			return IMAGE_EXTENSIONS;
		}
	}

	/**
	 * @return {void}
	 */
	protected pick() {
		Dropbox.choose({
			linkType: 'direct',
			extensions: this.extensions,
			multiselect: this.multiSelect,
			success: this._onPicked.bind( this ),
		});
	}

	/**
	 * @param {CUBDropboxFile} files
	 * @return {void}
	 */
	private _onPicked(
		files: CUBDropboxFile[]
	) {
		_.forEach(
			files,
			( file: CUBDropboxFile ) => {
				this.addFile(
					{
						filename: file.name,
						mimeType: '',
						size: file.bytes,
						url: file.link,
						thumbnailUrl: file.thumbnailLink,
						source: CUBFileSource.Dropbox,
						metadata: file,
					} as CUBFile
				);
			}
		);

		this.cdRef.markForCheck();
	}

}
