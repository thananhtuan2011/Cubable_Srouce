import {
	Component, EventEmitter, Inject,
	InjectionToken, Input, Optional,
	Output, ViewEncapsulation, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Observable, combineLatest } from 'rxjs';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import { Unsubscriber, CoerceBoolean, DefaultValue, untilCmpDestroyed } from '@core';
import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCToastService } from '../wgc-toast';

import { WGCIGoogleDriveFile } from './google-drive/wgc-google-drive-picker.directive';
import { WGCIDropboxFile } from './dropbox/wgc-dropbox-picker.directive';
import { WGCIOneDriveFile } from './one-drive/wgc-one-drive-picker.directive';

export type WGCIFilePickerMode = 'default' | 'inline';
export type WGCIFilePickerPosition = 'above' | 'below';
export type WGCIFileAttachmentType = 'local' | 'google-drive' | 'one-drive' | 'dropbox';

export interface WGCIFilePickerEvent {
	files: WGCIFile[];
	type: WGCIFileAttachmentType;
	localFiles?: FileList | File[];
}

export interface WGCIUploadedFile {
	destination: string;
	encoding: string;
	fieldname: string;
	filename: string;
	location: string;
	mimetype: string;
	originalname: string;
	path: string;
	size: number;
}

export type WGCIFile = Partial<WGCIUploadedFile>
	& Partial<WGCIGoogleDriveFile>
	& Partial<WGCIDropboxFile>
	& Partial<WGCIOneDriveFile>
	& {
		// Old
		name: string;
		size: number;
		attachmentType: WGCIFileAttachmentType;
		createdAt: Moment;
		'@previewUrl'?: string;

		// New
		'@cub.attachment.name'?: string;
		'@cub.attachment.size'?: number;
		'@cub.attachment.url'?: string;
		'@cub.attachment.source'?: WGCIFileAttachmentType;
		'@cub.attachment.attachedAt'?: Moment;
	};


// eslint-disable-next-line @typescript-eslint/naming-convention
export interface WGCIFileService<TUploadedFile = WGCIUploadedFile> {
	upload: ( files: File | FileList | File[], options?: ObjectType, useAuthorizedKey?: boolean ) => Observable<TUploadedFile>;
	downloadLocalFile: ( file: WGCIFile ) => void;
}

export const WGC_FILE_SERVICE: InjectionToken<WGCIFileService>
	= new InjectionToken<WGCIFileService>( 'WGC_FILE_SERVICE' );

export class WGCCloudStorageConfig {

	private _googleDrive: boolean;
	private _dropbox: boolean;
	private _oneDrive: boolean;

	get googleDrive(): boolean { return this._googleDrive; }
	set googleDrive( value: boolean ) { this._googleDrive = value; }

	get dropbox(): boolean { return this._dropbox; }
	set dropbox( value: boolean ) { this._dropbox = value; }

	get oneDrive(): boolean { return this._oneDrive; }
	set oneDrive( value: boolean ) { this._oneDrive = value; }

}

export const WGC_CLOUD_STORAGE_CONFIG: InjectionToken<WGCCloudStorageConfig>
	= new InjectionToken<WGCCloudStorageConfig>( 'WGC_CLOUD_STORAGE_CONFIG' );

@Unsubscriber()
@Component({
	selector		: 'wgc-file-picker',
	templateUrl		: './wgc-file-picker.pug',
	styleUrls		: [ './wgc-file-picker.scss' ],
	host			: { class: 'wgc-file-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCFilePickerComponent {

	@HostBinding( 'class.wgc-file-picker--inline' )
	get classInline(): boolean { return this.mode === 'inline'; }

	@Input() @DefaultValue() @CoerceBoolean() public useAuthorizedKey: boolean = true;
	@Input() public fileAccept: string;
	@Input() public googleDriveMimeTypes: string[];
	@Input() public dropboxExtensions: string[];
	@Input() public oneDriveExtensions: string[];
	@Input() @DefaultValue() @CoerceBoolean() public multiSelect: boolean = true;
	@Input() @DefaultValue() public mode: WGCIFilePickerMode = 'default';

	@Output() public picked: EventEmitter<WGCIFilePickerEvent> = new EventEmitter<WGCIFilePickerEvent>();

	public isUploading: boolean;
	public maxFileSize: number = APP_CONSTANT.ALLOW_FILE_SIZE;
	public uploadingFiles: FileList | File[];
	public uploadingFileStates: ObjectType[];
	public close: ( event?: Event ) => void;
	public onPicked: ( event: WGCIFilePickerEvent ) => void;

	private _imageOnly: boolean;

	@Input()
	get imageOnly(): boolean { return this._imageOnly; }
	set imageOnly( value: boolean ) {
		this._imageOnly = coerceBooleanProperty( value );

		if ( !this._imageOnly ) return;

		this.fileAccept = this.fileAccept || 'image/*';
		this.googleDriveMimeTypes = this.googleDriveMimeTypes || [ 'image/png', 'image/jpg', 'image/gif' ];
		this.dropboxExtensions = this.dropboxExtensions || [ '.png', '.jpg', '.jpeg', '.gif' ];
		this.oneDriveExtensions = this.oneDriveExtensions || [ '.png', '.jpg', '.jpeg', '.gif' ];
	}

	/**
	 * @constructor
	 * @param {WGCCloudStorageConfig} cloudStorageConfig
	 * @param {WGCIFileService} _fileService
	 * @param {WGCToastService} _wgcToastService
	 */
	constructor(
		@Optional() @Inject( WGC_CLOUD_STORAGE_CONFIG ) public cloudStorageConfig: WGCCloudStorageConfig,
		@Optional() @Inject( WGC_FILE_SERVICE ) private _fileService: WGCIFileService,
		private _wgcToastService: WGCToastService
	) {}

	/**
	 * @param {FileList | File[]} files
	 * @return {void}
	 */
	public onLocalPicked( files: FileList | File[] ) {
		const allowImageTypeLookup: ObjectType<string> = _.keyBy( APP_CONSTANT.ALLOW_IMAGE_FILES );
		const localFiles: FileList | File[] = _.filter( files, ( file: File ) => {
			let valid: boolean = file.size <= this.maxFileSize;

			if ( this.imageOnly ) valid = _.has( allowImageTypeLookup, file?.type );

			return valid;
		} );

		if ( !localFiles?.length ) {
			this._wgcToastService.danger( 'WGC.MESSAGE.UPLOAD_FILE_FAIL' );
			return;
		}

		if ( this._fileService ) {
			const uploading: Observable<WGCIUploadedFile>[] = [];
			const successFiles: WGCIFile[] = [];

			this.isUploading = false;
			this.uploadingFileStates = [];
			this.uploadingFiles = _.map( localFiles, ( file: File ): File => {
				uploading.push( this._fileService.upload( file, { reportProgress: true, observe: 'events' }, this.useAuthorizedKey ) );
				return file;
			} );

			combineLatest( uploading )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( results: any ) => {
					_.forEach( results, ( result: any, index: any ) => {
						const uploadingFileState: ObjectType = this.uploadingFileStates[ index ] || {};

						switch ( result.type ) {
							case 1: // Uploading
								uploadingFileState.loaded = result.loaded;
								uploadingFileState.total = result.total;
								break;
							case 4: // Complete
								const body: any = result.body;
								const success: boolean = result.status === 200;

								uploadingFileState.success = success;

								if ( success ) successFiles[ index ] = body[ 0 ];
								break;
						}

						this.uploadingFileStates[ index ] = uploadingFileState;
					} );
				},
				complete: () => {
					this.isUploading = false;

					this.pick( successFiles, 'local', localFiles );
				},
			});
			return;
		}

		this.pick( undefined, 'local', localFiles );
	}

	/**
	 * @param {WGCIGoogleDriveFile[]} files
	 * @return {void}
	 */
	public onGoogleDrivePicked( files: WGCIGoogleDriveFile[] ) {
		const validFiles: WGCIFile[] = (
			this.imageOnly
				? _.filter( files, ( file: WGCIGoogleDriveFile ) => file.type === 'photo' )
				: files
		) as WGCIFile[];

		validFiles?.length
			? this.pick( validFiles, 'google-drive' )
			: this._wgcToastService.danger( 'WGC.MESSAGE.UPLOAD_FILE_FAIL' );
	}

	/**
	 * @param {WGCIDropboxFile[]} files
	 * @return {void}
	 */
	public onDropboxPicked( files: WGCIDropboxFile[] ) {
		const allowImageTypeLookup: ObjectType<string> = _.keyBy( APP_CONSTANT.ALLOW_IMAGE_FILES );
		const validFiles: WGCIFile[] = (
			this.imageOnly
				? _.filter( files, ( file: WGCIDropboxFile ) => _.has( allowImageTypeLookup, `image/${file.name.split( '.' ).pop()}` ) )
				: files
		) as WGCIFile[];

		validFiles?.length
			? this.pick( validFiles, 'dropbox' )
			: this._wgcToastService.danger( 'WGC.MESSAGE.UPLOAD_FILE_FAIL' );
	}

	/**
	 * @param {WGCIOneDriveFile[]} files
	 * @return {void}
	 */
	public onOneDrivePicked( files: WGCIOneDriveFile[] ) {
		const allowImageTypeLookup: ObjectType<string> = _.keyBy( APP_CONSTANT.ALLOW_IMAGE_FILES );
		const validFiles: WGCIFile[] = (
			this.imageOnly
				? _.filter( files, ( file: WGCIOneDriveFile ) => _.has( allowImageTypeLookup, `image/${file.name.split( '.' ).pop()}` ) )
				: files
		) as WGCIFile[];

		validFiles?.length
			? this.pick( validFiles, 'one-drive' )
			: this._wgcToastService.danger( 'WGC.MESSAGE.UPLOAD_FILE_FAIL' );
	}

	/**
	 * @param {WGCIFile[]} files
	 * @param {WGCIFileAttachmentType} attachmentType
	 * @param {FileList | File[]} localFiles
	 * @return {void}
	 */
	public pick( files: WGCIFile[], attachmentType: WGCIFileAttachmentType, localFiles?: FileList | File[] ) {
		files = _.map( files, ( file: WGCIFile ) => ({
			...file,

			// Old
			attachmentType,
			name			: file.name || file.originalname || file.filename,
			size			: file.size || file.sizeBytes || file.bytes,
			createdAt		: file.createdAt || moment(),
			'@previewUrl'	: file[ '@previewUrl' ] || this._createPreviewUrl( attachmentType, file ),

			// New
			'@cub.attachment.name'		: file.name || file.originalname || file.filename,
			'@cub.attachment.size'		: file.size || file.sizeBytes || file.bytes,
			'@cub.attachment.url'		: this._createPreviewUrl( attachmentType, file ),
			'@cub.attachment.source'	: attachmentType,
			'@cub.attachment.attachedAt': moment(),
		}) );

		const event: WGCIFilePickerEvent = { files, localFiles, type: attachmentType };

		this.picked.emit( event );
		_.isFunction( this.onPicked ) && this.onPicked( event );
	}

	/**
	 * @param {WGCIFileAttachmentType} attachmentType
	 * @param {WGCIFile} file
	 * @return {string}
	 */
	private _createPreviewUrl( attachmentType: WGCIFileAttachmentType, file: WGCIFile ): string {
		switch ( attachmentType ) {
			case 'local':
				return file.location;
			case 'google-drive':
				return `//drive.google.com/uc?id=${file.id}&export=download`;
			case 'dropbox':
				return file.link;
			case 'one-drive':
				return file[ '@microsoft.graph.downloadUrl' ];
		}
	}

}
