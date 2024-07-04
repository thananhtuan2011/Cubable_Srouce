import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	ViewEncapsulation
} from '@angular/core';

import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBIPopupInstance,
	CUBPopupRef
} from '../../popup';

import {
	CUBFile
} from '../file/file.component';
import {
	CUBFilePickerPickedEvent
} from '../file-picker/file-picker.component';

export type CUBFileManagerContext = {
	files: CUBFile[];
	readonly?: boolean;
	onDone?: ( files: CUBFile[] ) => void;
	onClosed?: () => void;
};

@Component({
	selector: 'cub-file-manager',
	templateUrl: './file-manager.pug',
	styleUrls: [ './file-manager.scss' ],
	host: { class: 'cub-file-manager' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFileManagerComponent
implements CUBIPopupInstance {

	protected files: CUBFile[];
	protected readonly: boolean;

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {CUBFileManagerContext} popupContext
	 */
	constructor(
		@Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Inject( CUB_POPUP_CONTEXT )
		protected popupContext: CUBFileManagerContext
	) {
		this.files
			= popupContext.files;
		this.readonly
			= popupContext.readonly;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onClosed() {
		this
		.popupContext
		.onClosed?.();
	}

	/**
	 * @param {CUBFilePickerPickedEvent} e
	 * @return {void}
	 */
	protected onFilePicked(
		e: CUBFilePickerPickedEvent
	) {
		this.files = [
			...this.files,
			...e.files,
		];
	}

	/**
	 * @return {void}
	 */
	protected done() {
		this
		.popupContext
		.onDone?.( this.files );

		this.close();
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.popupRef.close();
	}

}
