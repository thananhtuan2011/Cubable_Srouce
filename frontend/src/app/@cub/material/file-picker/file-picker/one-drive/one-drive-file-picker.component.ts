import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	Inject,
	InjectionToken,
	Optional,
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

export type CUBOneDriveFile = {
	id: string;
	name: string;
	size: number;
	'@microsoft.graph.downloadUrl': string;
	'@odata.context': string;
};

export const CUB_MICROSOFT_CLIENT_ID: InjectionToken<string>
	= new InjectionToken<string>( 'CUB_MICROSOFT_CLIENT_ID' );
export const CUB_MICROSOFT_REDIRECT_URL: InjectionToken<string>
	= new InjectionToken<string>( 'CUB_MICROSOFT_REDIRECT_URL' );

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const OneDrive: any;

const IMAGE_EXTENSIONS: string = [
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.svg',
].join( ', ' );

@Component({
	selector: 'cub-one-drive-file-picker',
	templateUrl: './one-drive-file-picker.pug',
	styleUrls: [ '../file-picker.inside.scss' ],
	host: { class: 'cub-file-picker-inside cub-one-drive-file-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: CUBFilePickerInside,
			useExisting: forwardRef(
				() => CUBOneDriveFilePickerComponent
			),
		},
	],
})
export class CUBOneDriveFilePickerComponent
	extends CUBFilePickerInside {

	get extensions(): string {
		if ( this.fileAccept ) {
			return this.fileAccept as string;
		}

		if ( this.imageOnly ) {
			return IMAGE_EXTENSIONS;
		}
	}

	/**
	 * @constructor
	 * @param {string} MICROSOFT_CLIENT_ID
	 */
	constructor(
		@Optional() @Inject( CUB_MICROSOFT_CLIENT_ID )
		protected readonly MICROSOFT_CLIENT_ID: string,
		@Optional() @Inject( CUB_MICROSOFT_REDIRECT_URL )
		protected readonly MICROSOFT_REDIRECT_URL: string
	) {
		super();
	}

	/**
	 * @return {void}
	 */
	protected pick() {
		if ( !this.MICROSOFT_CLIENT_ID ) {
			throw new Error(
				'Missing provider: MICROSOFT_CLIENT_ID'
			);
		}

		if ( !this.MICROSOFT_REDIRECT_URL ) {
			throw new Error(
				'Missing provider: MICROSOFT_REDIRECT_URL'
			);
		}

		OneDrive.open({
			action: 'download',
			clientId: this.MICROSOFT_CLIENT_ID,
			multiSelect: this.multiSelect,
			advanced: {
				redirectUri: this.MICROSOFT_REDIRECT_URL,
				filter: this.extensions,
			},
			success: ( { value }: any ) => {
				this._onPicked( value );
			},
		});
	}

	/**
	 * @param {CUBOneDriveFile} files
	 * @return {void}
	 */
	private _onPicked(
		files: CUBOneDriveFile[]
	) {
		_.forEach(
			files,
			( file: CUBOneDriveFile ) => {
				this.addFile(
					{
						filename: file.name,
						mimeType: '',
						size: file.size,
						url: file[ '@microsoft.graph.downloadUrl' ],
						source: CUBFileSource.OneDrive,
						metadata: file,
					} as CUBFile
				);
			}
		);

		this.cdRef.markForCheck();
	}

}
