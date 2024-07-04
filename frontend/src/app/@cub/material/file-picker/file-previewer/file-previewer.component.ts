import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBIPopupInstance,
	CUBPopupRef
} from '../../popup';

import {
	CUBFileObject,
	CUBFilePreviewType
} from '../file/file.object';
import {
	CUBFile
} from '../file/file.component';

export type CUBFilePreviewerContext = {
	previewingIndex: number;
	files: string[] | CUBFile[];
	removable?: boolean;
	onDone?: ( files: string[] | CUBFile[] ) => void;
	onClosed?: () => void;
};

@Component({
	selector: 'cub-file-previewer',
	templateUrl: './file-previewer.pug',
	styleUrls: [ './file-previewer.scss' ],
	host: { class: 'cub-file-previewer' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFilePreviewerComponent
implements CUBIPopupInstance {

	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
	protected readonly FilePreviewType
		= CUBFilePreviewType;

	protected files: string[] | CUBFile[];
	protected removable: boolean;
	protected previewingFile: CUBFileObject
		= new CUBFileObject();

	private _previewingIndex: number = 0;
	private _isFileRemoved: boolean;

	@Input()
	get previewingIndex(): number {
		return this._previewingIndex;
	}
	set previewingIndex( idx: number ) {
		this._previewingIndex = idx;

		this.previewingFile.update(
			this.files[ idx ]
		);
	}

	get isFirstFilePreviewing(): boolean {
		return this.previewingIndex === 0;
	}

	get isLastFilePreviewing(): boolean {
		return this.files?.length
			&& this.previewingIndex
					=== this.files.length - 1;
	}

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {CUBFilePreviewerContext} popupContext
	 */
	constructor(
		@Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Inject( CUB_POPUP_CONTEXT )
		protected popupContext: CUBFilePreviewerContext
	) {
		this.files
			= popupContext.files;
		this.removable
			= popupContext.removable;
		this.previewingIndex
			= popupContext.previewingIndex
				|| this.previewingIndex;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onClosed() {
		this
		.popupContext
		.onClosed?.();

		if ( !this._isFileRemoved ) {
			return;
		}

		this
		.popupContext
		.onDone?.( this.files );
	}

	/**
	 * @return {void}
	 */
	protected remove() {
		this._isFileRemoved = true;

		this.files.splice(
			this.previewingIndex,
			1
		);

		if ( !this.files.length ) {
			this.close();
			return;
		}

		this.previewingFile.update(
			this.files[ this.previewingIndex ]
		);
	}

	/**
	 * @return {void}
	 */
	protected done() {
		this
		.popupContext
		.onDone?.( this.files );
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected previewPreviousFile() {
		if ( this.isFirstFilePreviewing ) {
			return;
		}

		this.previewingIndex--;
	}

	/**
	 * @return {void}
	 */
	protected previewNextFile() {
		if ( this.isLastFilePreviewing ) {
			return;
		}

		this.previewingIndex++;
	}

}
