import {
	ChangeDetectionStrategy,
	Component,
	inject
} from '@angular/core';
import _ from 'lodash';

import {
	CUBFileManagerService,
	CUBFilePickerPickedEvent,
	CUBFilePickerService,
	CUBFilePreviewerService
} from '@cub/material/file-picker';
import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	AttachmentData
} from '@main/common/field/interfaces';

import {
	FieldCellEditable
} from '../field-cell-editable';

@Component({
	selector: 'attachment-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: 'attachment-field-cell attachment-field-cell-full',
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentFieldCellFullComponent
	extends FieldCellEditable<AttachmentData> {

	private readonly _filePickerService: CUBFilePickerService
		= inject( CUBFilePickerService );
	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );
	private readonly _fileManagerService: CUBFileManagerService
		= inject( CUBFileManagerService );

	private _filePickerPopupRef: CUBPopupRef;
	private _filePreviewerPopupRef: CUBPopupRef;
	private _fileManagerPopupRef: CUBPopupRef;

	get isPopupOpened(): boolean {
		return this._filePickerPopupRef?.isOpened
			|| this._filePreviewerPopupRef?.isOpened
			|| this._fileManagerPopupRef?.isOpened;
	}

	/**
	 * @return {void}
	 */
	protected override onTouch() {
		if ( this.readonly ) {
			return;
		}

		this.pickFile();
	}

	/**
	 * @return {void}
	 */
	protected pickFile() {
		if ( this.isPopupOpened ) {
			return;
		}

		this._filePickerPopupRef
			= this
			._filePickerService
			.pick(
				{
					onPicked: this._onFilePicked.bind( this ),
				},
				{
					restoreFocus: this.elementRef,
				}
			);
	}

	/**
	 * @param {number=} idx
	 * @return {void}
	 */
	protected previewFile(
		idx?: number
	) {
		if ( this.isPopupOpened ) {
			return;
		}

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files: _.cloneDeep( this.data ),
					removable: !this.readonly,
					previewingIndex: idx,
					onDone:this.save.bind( this ),
				},
				{
					restoreFocus: this.elementRef,
				}
			);
	}

	/**
	 * @return {void}
	 */
	protected manageFiles() {
		if ( this.isPopupOpened ) {
			return;
		}

		this._fileManagerPopupRef
			= this
			._fileManagerService
			.manage(
				{
					files: _.cloneDeep( this.data ),
					readonly: this.readonly,
					onDone: this.save.bind( this ),
				},
				{
					restoreFocus: this.elementRef,
				}
			);
	}

	/**
	 * @param {CUBFilePickerPickedEvent} e
	 * @return {void}
	 */
	private _onFilePicked(
		e: CUBFilePickerPickedEvent
	) {
		this.data ||= [];

		this.data.unshift( ...e.files );

		this.save();
	}

}
