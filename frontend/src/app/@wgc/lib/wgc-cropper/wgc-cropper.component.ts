import {
	Component, Input, Output,
	EventEmitter, ElementRef, ViewEncapsulation,
	AfterViewInit, ViewChild, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';
import _ from 'lodash';
import Cropper from 'cropperjs';

import { CoerceBoolean, CoerceCssPixel } from '@core';

export interface WGCICroppedEvent {
	image: string;
	blob: Blob;
}

@Component({
	selector		: 'wgc-cropper',
	templateUrl		: './wgc-cropper.pug',
	styleUrls		: [ './wgc-cropper.scss' ],
	host			: { class: 'wgc-cropper' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCropperComponent implements AfterViewInit {

	@HostBinding( 'style.--cropper-width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.--cropper-height' )
	get styleHeight(): string { return this.height; }

	@HostBinding( 'class.wgc-cropper--circle' )
	get classCircle(): boolean { return this.circle; }

	@ViewChild( 'cropper' ) public cropperEle: ElementRef<HTMLImageElement>;

	@Input() public image: string | Blob;
	@Input() public options: Cropper.Options;
	@Input() @CoerceBoolean() public circle: boolean;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public height: string;

	@Output() public init: EventEmitter<WGCCropperComponent> = new EventEmitter<WGCCropperComponent>();
	@Output() public cropped: EventEmitter<WGCICroppedEvent> = new EventEmitter<WGCICroppedEvent>();

	private _image: string;
	private _cropper: Cropper;
	private _defaultOptions: Cropper.Options = { viewMode: 1 };

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		const callback: ( image: string ) => void = ( image: string ) => {
			this._image = image;

			this._initCropper();
		};

		_.isString( this.image )
			? callback( this.image as string )
			: this._readImage( this.image as Blob, callback );
	}

	/**
	 * @return {void}
	 */
	public crop() {
		const cropboxData: Cropper.CropBoxData = this._cropper.getCropBoxData();
		const width: number = cropboxData.width || 300;
		const height: number = cropboxData.height || 300;
		const imageData: HTMLCanvasElement = this._cropper.getCroppedCanvas({
			width, height,
			imageSmoothingEnabled: true,
			imageSmoothingQuality: 'high',
		});

		imageData.toBlob( ( blob: Blob ) => {
			this.cropped.emit({ image: imageData.toDataURL( 'image/png' ), blob });
		}, 'image/png', .7 );
	}

	/**
	 * @param {Cropper.ViewMode} viewMode
	 * @return {void}
	 */
	public setViewMode( viewMode: Cropper.ViewMode ) {
		this._initCropper({ viewMode });
	}

	/**
	 * @param {Cropper.Options} options
	 * @return {void}
	 */
	private _initCropper( options?: Cropper.Options ) {
		this._cropper?.destroy();

		this._cropper = new Cropper(
			this.cropperEle.nativeElement,
			{ ...this._defaultOptions, ...this.options, ...options }
		);

		this._cropper.replace( this._image );

		this.init.emit( this );
	}

	/**
	 * @param {Blob} blob
	 * @param {Function} callback
	 * @return {void}
	 */
	private _readImage( blob: Blob, callback: ( image: string ) => void ) {
		const reader: FileReader = new FileReader();

		reader.onloadend = () => callback( reader.result as string );
		reader.readAsDataURL( blob );
	}

}
