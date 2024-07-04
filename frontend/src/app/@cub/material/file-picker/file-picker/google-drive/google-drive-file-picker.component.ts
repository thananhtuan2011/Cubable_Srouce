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

export type CUBGoogleDriveFile = {
	description: string;
	embedUrl: string;
	iconUrl: string;
	id: string;
	isShared: boolean;
	lastEditedUtc: number;
	mimeType: string;
	name: string;
	organizationDisplayName: string;
	rotation: number;
	rotationDegree: number;
	serviceId: string;
	sizeBytes: number;
	type: string;
	url: string;
};

export const CUB_GOOGLE_CLIENT_ID: InjectionToken<string>
	= new InjectionToken<string>( 'CUB_GOOGLE_CLIENT_ID' );

declare const gapi: any;
declare const google: any;

let GOOGLE_ACCESS_TOKEN: string;

@Component({
	selector: 'cub-google-drive-file-picker',
	templateUrl: './google-drive-file-picker.pug',
	styleUrls: [ '../file-picker.inside.scss' ],
	host: { class: 'cub-file-picker-inside cub-google-drive-file-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: CUBFilePickerInside,
			useExisting: forwardRef(
				() => CUBGoogleDriveFilePickerComponent
			),
		},
	],
})
export class CUBGoogleDriveFilePickerComponent
	extends CUBFilePickerInside {

	get mimeTypes(): string {
		if ( this.fileAccept ) {
			return this.fileAccept as string;
		}

		if ( this.imageOnly ) {
			return 'image/*';
		}
	}

	/**
	 * @constructor
	 * @param {string} GOOGLE_CLIENT_ID
	 */
	constructor(
		@Optional() @Inject( CUB_GOOGLE_CLIENT_ID )
		protected readonly GOOGLE_CLIENT_ID: string
	) {
		super();
	}

	/**
	 * @return {void}
	 */
	protected pick() {
		if ( GOOGLE_ACCESS_TOKEN ) {
			this._buildPicker( GOOGLE_ACCESS_TOKEN );
			return;
		}

		if ( !this.GOOGLE_CLIENT_ID ) {
			throw new Error(
				'Missing provider: GOOGLE_CLIENT_ID'
			);
		}

		gapi.load(
			'auth',
			{
				callback: () => {
					google
					.accounts
					.oauth2
					.initTokenClient({
						// eslint-disable-next-line @typescript-eslint/naming-convention
						client_id: this.GOOGLE_CLIENT_ID,
						scope: 'https://www.googleapis.com/auth/drive',
						immediate: false,
						callback: (	{
							error,
							access_token: accessToken,
						}: any ) => {
							if ( error
								|| !accessToken ) {
								return;
							}

							this._buildPicker(
								GOOGLE_ACCESS_TOKEN
									= accessToken
							);
						},
					}).requestAccessToken();
				},
			}
		);
		gapi.load( 'picker' );
	}

	/**
	 * @param {string} accessToken
	 * @return {void}
	 */
	private _buildPicker(
		accessToken: string
	) {
		const view: any
			= new google
			.picker
			.View(
				google
				.picker
				.ViewId
				.DOCS
			);

		view.setMimeTypes(
			this.mimeTypes
		);

		const picker: any
			= new google
			.picker
			.PickerBuilder()
			.addView( view )
			.addView(
				new google
				.picker
				.DocsUploadView()
			)
			.enableFeature(
				google
				.picker
				.Feature
				.NAV_HIDDEN
			)
			.enableFeature(
				this.multiSelect
					? google
					.picker
					.Feature
					.MULTISELECT_ENABLED
					: undefined
			)
			.setOAuthToken( accessToken )
			.setCallback(( e: any ) => {
				if ( e[ google.picker.Response.ACTION ]
					!== google.picker.Action.PICKED ) {
					return;
				}

				this._onPicked(
					e[ google.picker.Response.DOCUMENTS ]
				);
			})
			.build();

		picker.setVisible( true );
	}

	/**
	 * @param {CUBGoogleDriveFile} files
	 * @return {void}
	 */
	private _onPicked(
		files: CUBGoogleDriveFile[]
	) {
		_.forEach(
			files,
			( file: CUBGoogleDriveFile ) => {
				this.addFile(
					{
						filename: file.name,
						mimeType: file.mimeType,
						size: file.sizeBytes,
						url: file.url,
						source: CUBFileSource.GoogleDrive,
						metadata: file,
					} as CUBFile
				);
			}
		);

		this.cdRef.markForCheck();
	}

}
