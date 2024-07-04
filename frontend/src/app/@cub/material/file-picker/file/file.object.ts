import {
	ɵDomSanitizerImpl,
	SafeResourceUrl
} from '@angular/platform-browser';
import {
	ulid,
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CUBGoogleDriveFile
} from '../file-picker/google-drive/google-drive-file-picker.component';

import {
	CUBFile,
	CUBFileSource
} from './file.component';
import * as mimeTypeLookup
	from './file-extension-to-mime-types.json';

export enum CUBFilePreviewType {
	Image = 'image',
	Audio = 'audio',
	Video = 'video',
	Iframe = 'iframe',
}

export type CUBFilePreviewInfo = {
	type: CUBFilePreviewType;
	url: string | SafeResourceUrl;
};

type TFile = string | CUBFile;

const trustResourceUrl: ɵDomSanitizerImpl[ 'bypassSecurityTrustResourceUrl' ]
	= new ɵDomSanitizerImpl( document )
	.bypassSecurityTrustResourceUrl;
const DOCUMENT_PREVIEW_URL: string
	= 'https://view.officeapps.live.com/op/view.aspx?src=';
const FILENAME_REGEX: RegExp = /(?:(.+)(\.[^.]+))?$/;
const IMAGE_MIME_TYPE_REGEX: RegExp = /^image\/.+$/;
const AUDIO_MIME_TYPE_REGEX: RegExp = /^audio\/.+$/;
const VIDEO_MIME_TYPE_REGEX: RegExp = /^video\/.+$/;
const TEXT_MIME_TYPE_REGEX: RegExp = /^text\/.+$/;
const PDF_MIME_TYPE: string = 'application/pdf';
const AUDIO_SUPPORTED_PREVIEW_MIME_TYPES: Set<string>
	= new Set([
		'audio/mpeg',
		'audio/ogg',
		'audio/wav',
	]);
const VIDEO_SUPPORTED_PREVIEW_MIME_TYPES: Set<string>
	= new Set([
		'video/mp4',
		'video/ogg',
		'video/webm',
	]);
const COMPRESSED_MIME_TYPES: Set<string>
	= new Set([
		'application/gzip',
		'application/vnd.rar',
		'application/x-7z-compressed',
		'application/x-bzip',
		'application/x-bzip2',
		'application/zip',
	]);
const WORD_MIME_TYPES: Set<string>
	= new Set([
		'application/msword',
		'application/vnd.google-apps.document',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	]);
const EXCEL_MIME_TYPES: Set<string>
	= new Set([
		'application/vnd.google-apps.spreadsheet',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'text/csv',
	]);
const POWER_POINT_MIME_TYPES: Set<string>
	= new Set([
		'application/vnd.google-apps.presentation',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	]);

const isImageFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return !!mimeType
			.match( IMAGE_MIME_TYPE_REGEX );
		}
	);

const isAudioFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return !!mimeType
			.match( AUDIO_MIME_TYPE_REGEX );
		}
	);

const isVideoFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return !!mimeType
			.match( VIDEO_MIME_TYPE_REGEX );
		}
	);

const isTextFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return !!mimeType
			.match( TEXT_MIME_TYPE_REGEX );
		}
	);

const isWordFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return WORD_MIME_TYPES
			.has( mimeType );
		}
	);

const isExcelFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return EXCEL_MIME_TYPES
			.has( mimeType );
		}
	);

const isPowerPointFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return POWER_POINT_MIME_TYPES
			.has( mimeType );
		}
	);

const isCompressedFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return COMPRESSED_MIME_TYPES
			.has( mimeType );
		}
	);

const isPDFFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return mimeType === PDF_MIME_TYPE;
		}
	);

const isAudioPreviewSupportedFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return AUDIO_SUPPORTED_PREVIEW_MIME_TYPES
			.has( mimeType );
		}
	);

const isVideoPreviewSupportedFn: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): boolean => {
			return VIDEO_SUPPORTED_PREVIEW_MIME_TYPES
			.has( mimeType );
		}
	);

const getPreviewInfo: ReturnType<typeof _.memoize>
	= _.memoize(
		(
			file: CUBFileObject
		): CUBFilePreviewInfo => {
			let url: string | SafeResourceUrl;
			let type: CUBFilePreviewType;

			if ( file.source
					=== CUBFileSource.GoogleDrive ) {
				url = trustResourceUrl(
					( file.metadata as CUBGoogleDriveFile )
					.embedUrl
				);
				type = CUBFilePreviewType.Iframe;
			} else if (
				isImageFn( file.mimeType )
			) {
				url = file.url;
				type = CUBFilePreviewType.Image;
			} else if (
				isAudioFn( file.mimeType )
					&& isAudioPreviewSupportedFn(
						file.mimeType
					)
			) {
				url = file.url;
				type = CUBFilePreviewType.Audio;
			} else if (
				isVideoFn( file.mimeType )
					&& isVideoPreviewSupportedFn(
						file.mimeType
					)
			) {
				url = file.url;
				type = CUBFilePreviewType.Video;
			} else if (
				isWordFn( file.mimeType )
					|| isExcelFn( file.mimeType )
					|| isPowerPointFn( file.mimeType )
			) {
				url = trustResourceUrl(
					DOCUMENT_PREVIEW_URL + file.url
				);
				type = CUBFilePreviewType.Iframe;
			} else if (
				isTextFn( file.mimeType )
					|| isPDFFn( file.mimeType )
			) {
				url = trustResourceUrl(
					file.url as string
				);
				type = CUBFilePreviewType.Iframe;
			}

			return { type, url };
		},
		( file: CUBFileObject ): ULID => file.id
	);

const getDescription: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): string => {
			let description: string;

			if ( isWordFn( mimeType ) ) {
				description = 'Word';
			} else if ( isExcelFn( mimeType ) ) {
				description = 'Excel';
			} else if ( isPowerPointFn( mimeType ) ) {
				description = 'Power Point';
			} else if ( isCompressedFn( mimeType ) ) {
				description = 'Compressed';
			} else {
				description
					= mimeType.split( '/' )[ 1 ];
			}

			return description || '';
		}
	);

const getIconUrl: ReturnType<typeof _.memoize>
	= _.memoize(
		( mimeType: string ): string => {
			let icon: string;

			if ( isImageFn( mimeType ) ) {
				icon = 'image';
			} else if ( isAudioFn( mimeType ) ) {
				icon = 'music';
			} else if ( isVideoFn( mimeType ) ) {
				icon = 'video';
			} else if ( isTextFn( mimeType ) ) {
				icon = 'text';
			} else if ( isWordFn( mimeType ) ) {
				icon = 'word';
			} else if ( isExcelFn( mimeType ) ) {
				icon = 'excel';
			} else if ( isPowerPointFn( mimeType ) ) {
				icon = 'power-point';
			} else if ( isPDFFn( mimeType ) ) {
				icon = 'pdf';
			} else if ( isCompressedFn( mimeType ) ) {
				icon = 'zip';
			} else {
				icon = 'file';
			}

			return `assets/@cub/images/files/${icon}.svg`;
		}
	);

const convertUrlToFilename: ReturnType<typeof _.memoize>
	= _.memoize(
		( url: string ): string => {
			return url.substring(
				url.lastIndexOf( '/' ) + 1
			);
		}
	);

const serializeFilename: ReturnType<typeof _.memoize>
	= _.memoize(
		( filename: string ): {
			name: string;
			extension: string;
			mimeType: string;
		} => {
			const arr: RegExpExecArray
				= FILENAME_REGEX.exec( filename );
			let name: string
				= arr[ 1 ];
			let extension: string
				= arr[ 2 ];
			let mimeType: string
				= mimeTypeLookup[ extension ];

			if ( !mimeType ) {
				name = filename;
				extension = mimeType = '';
			}

			return {
				name,
				extension,
				mimeType,
			};
		}
	);

export class CUBFileObject {

	public id: ULID;
	public filename: string;
	public name: string;
	public extension: string;
	public mimeType: string;
	public description: string;
	public size: number;
	public url: string;
	public source: CUBFileSource;
	public attachedAt: Date;
	public metadata: any;
	public iconUrl: any;
	public thumbnailUrl: string;

	protected file: TFile;

	get isEmpty(): boolean {
		return !this.file;
	}

	get previewInfo(): CUBFilePreviewInfo {
		return getPreviewInfo( this );
	}

	/**
	 * @constructor
	 * @param {TFile=} file
	 */
	constructor( file?: TFile ) {
		this.update( file );
	}

	/**
	 * @param {TFile} file
	 * @return {void}
	 */
	public update( file: TFile ) {
		this.file = file;

		let id: ULID;
		let filename: string;
		let name: string;
		let extension: string;
		let mimeType: string;
		let description: string;
		let size: number;
		let url: string;
		let iconUrl: string;
		let thumbnailUrl: string;
		let source: CUBFileSource;
		let attachedAt: Date;
		let metadata: any;

		if ( file ) {
			if ( _.isString( file ) ) {
				id = ulid();
				filename = convertUrlToFilename( file );
				url = file;
			} else {
				id = file.id;
				filename = file.filename;
				mimeType = file.mimeType;
				size = file.size;
				url = file.url;
				thumbnailUrl = file.thumbnailUrl;
				source = file.source;
				attachedAt = file.attachedAt;
				metadata = file.metadata;
			}

			const r: {
				name: string;
				extension: string;
				mimeType: string;
			} = serializeFilename( filename );

			mimeType ||= r.mimeType;

			name = r.name;
			extension = r.extension;
			description = getDescription( mimeType );
			iconUrl = getIconUrl( mimeType );

			if ( !thumbnailUrl
				&& source !== CUBFileSource.GoogleDrive
				&& isImageFn( mimeType ) ) {
				thumbnailUrl = url;
			}
		}

		this.id = id;
		this.filename = filename;
		this.name = name;
		this.extension = extension;
		this.mimeType = mimeType;
		this.description = description;
		this.size = size;
		this.url = url;
		this.iconUrl = iconUrl;
		this.thumbnailUrl = thumbnailUrl;
		this.source = source;
		this.attachedAt = attachedAt;
		this.metadata = metadata;
	}

	/**
	 * @return {void}
	 */
	public download() {
		if ( this.source !== CUBFileSource.Local ) {
			this._openFile( this.url );
			return;
		}

		fetch( this.url )
		.then(( response: Response ) => {
			return response.blob();
		})
		.then(( blob: Blob ) => {
			const link: HTMLAnchorElement
				= document.createElement( 'a' );

			link.href = URL.createObjectURL( blob );
			link.download = this.name;

			link.click();
			link.remove();
		})
		.catch(() => {
			this._openFile( this.url );
		});
	}

	/**
	 * @param {string} url
	 * @return {void}
	 */
	private _openFile( url: string ) {
		const win: Window
			= window.open( url, '_blank' );

		win.focus();
	}

}
