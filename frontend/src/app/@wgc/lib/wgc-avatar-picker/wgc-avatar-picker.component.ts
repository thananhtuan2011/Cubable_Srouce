import {
	Component, EventEmitter, Inject,
	Input, Optional, Output,
	TemplateRef, ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';
import { Subject } from 'rxjs';
import _ from 'lodash';

import { Unsubscriber, DefaultValue, untilCmpDestroyed, CoerceBoolean } from '@core';

import { CONSTANT as APP_CONSTANT } from '@resources';

import { WGCIUploadedFile, WGCIFileService, WGC_FILE_SERVICE } from '../wgc-file-picker';
import { WGCIAvatar, WGCIAvatarMode } from '../wgc-avatar';
import { WGCCropperComponent, WGCICroppedEvent } from '../wgc-cropper';
import { WGCDialogService, WGCIDialogRef } from '../wgc-dialog';
import { WGCToastService } from '../wgc-toast';

export interface WGCIAvatarPickedEvent {
	text?: string;
	avatar?: WGCIAvatar;
	file?: Blob;
	response?: WGCIUploadedFile;
}

@Unsubscriber()
@Component({
	selector		: 'wgc-avatar-picker',
	templateUrl		: './wgc-avatar-picker.pug',
	styleUrls		: [ './wgc-avatar-picker.scss' ],
	host			: { class: 'wgc-avatar-picker' },
	providers		: [ WGCDialogService ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCAvatarPickerComponent {

	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() public label: string;
	@Input() public text: string;
	@Input() public photo: string;
	@Input() public color: string;
	@Input() public icon: string;
	@Input() @DefaultValue() public mode: WGCIAvatarMode = 'text';
	@Input() public scrolling$: Subject<any>;

	@Output() public picked: EventEmitter<WGCIAvatarPickedEvent> = new EventEmitter<WGCIAvatarPickedEvent>();

	public isCropping: boolean;
	public croppedImage: string;
	public defaultIcon: string = '1F48E';
	public selectedFile: Blob;
	public cropper: WGCCropperComponent;
	public dialogRef: WGCIDialogRef;

	/**
	 * @constructor
	 * @param {WGCIFileService} _fileService
	 * @param {WGCDialogService} _wgcDialogService
	 * @param {WGCToastService} _wgcToastService
	 */
	constructor(
		@Optional() @Inject( WGC_FILE_SERVICE ) private _fileService: WGCIFileService,
		private _wgcDialogService: WGCDialogService,
		private _wgcToastService: WGCToastService
	) {}

	/**
	 * @return {void}
	 */
	public refresh() {
		this.croppedImage = undefined;
		this.selectedFile = undefined;
		this.isCropping = false;
	}

	/**
	 * @return {void}
	 */
	public pick() {
		const event: WGCIAvatarPickedEvent = {
			avatar	: { photo: this.photo, color: this.color, icon: this.icon || this.defaultIcon, mode: this.mode },
			text	: this.text,
			file	: this.selectedFile,
		};

		if ( this.mode !== 'photo' || !this.selectedFile ) {
			this.picked.emit( event );
			return;
		}

		if ( !this._fileService ) return;

		this._fileService
		.upload( [ this.selectedFile as File ] )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( result: WGCIUploadedFile ) => {
			const file: ObjectType = result[ 0 ];

			event.avatar.photo = file.location;
			event.response = result;

			this.picked.emit( event );
		} );
	}

	/**
	 * @return {void}
	 */
	public cropImage() {
		this.cropper.crop();
	}

	/**
	 * @return {void}
	 */
	public pickImage() {
		this.photo = this.croppedImage;

		this.pick();
		this.dialogRef.close();
	}

	/**
	 * @param {TemplateRef} dialog
	 * @return {void}
	 */
	public openDialog( dialog: TemplateRef<any> ) {
		this.dialogRef = this._wgcDialogService.open( dialog, { width: '500px', panelClass: 'wgc-avatar-picker' } );

		this.dialogRef
		.afterClosed()
		.subscribe( () => {
			this.selectedFile = undefined;
			this.isCropping = false;
		} );
	}

	/**
	 * @param {Blob} file
	 * @return {void}
	 */
	public onFileSelected( file: Blob ) {
		if ( !_.includes( APP_CONSTANT.ALLOW_IMAGE_FILES, file?.type ) ) {
			this._wgcToastService.warning(
				'WGC.LABEL.INVALID_FILE',
				'WGC.MESSAGE.INVALID_FILE_TYPE',
				{ translateParams: file }
			);
			return;
		}

		if ( file.size > APP_CONSTANT.ALLOW_FILE_SIZE ) {
			this._wgcToastService.warning(
				'WGC.LABEL.INVALID_FILE',
				'WGC.MESSAGE.INVALID_FILE_SIZE',
				{ translateParams: file }
			);
			return;
		}

		this.selectedFile = file;
		this.isCropping = true;
	}

	/**
	 * @param {WGCICroppedEvent} event
	 * @return {void}
	 */
	public onCropped( event: WGCICroppedEvent ) {
		this.selectedFile = event.blob;
		this.croppedImage = event.image;
		this.isCropping = false;
	}

}
