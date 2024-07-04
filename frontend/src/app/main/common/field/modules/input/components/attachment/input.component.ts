import {
	ChangeDetectionStrategy,
	Component,
	inject,
	ViewChild
} from '@angular/core';
import _ from 'lodash';

import {
	CUBFileManagerService,
	CUBFilePickerPickedEvent,
	CUBFilePickerService,
	CUBFilePreviewerService
} from '@cub/material/file-picker';
import {
	CUBFormFieldComponent
} from '@cub/material/form-field';
import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	ValueType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

import {
	AttachmentData
} from '../../../../interfaces';
import {
	AttachmentField
} from '../../../../objects';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Component({
	selector: 'attachment-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'attachment-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			AttachmentFieldInputComponent
		),
	],
})
export class AttachmentFieldInputComponent
	extends FieldInputEditable<AttachmentField, AttachmentData> {

	@ViewChild( CUBFormFieldComponent, { static: true } )
	protected readonly formField: CUBFormFieldComponent;

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
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected override onDataChanges(
		data: AttachmentData
	) {
		this.patchFormControlValue( data );
	}

	/**
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected override onDataChanged(
		data: AttachmentData
	) {
		super.onDataChanged( data, true );

		this.cdRef.markForCheck();
	}

	/**
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected onClick( data: AttachmentData ) {
		if (
			this.readonly
			|| !_.isStrictEmpty( data )
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		this.pickFile();
	}

	/**
	 * @return {KeyboardEvent} e
	 * @param {AttachmentData} data
	 */
	protected onKeydown(
		e: KeyboardEvent,
		data: AttachmentData
	) {
		if (
			this.readonly
			|| !_.isStrictEmpty( data )
			|| e.key === 'Tab'
			|| e.key === 'Escape'
			|| e.metaKey
			|| e.altKey
			|| e.shiftKey
			|| e.ctrlKey
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		this.pickFile();
	}

	/**
	 * @return {void}
	 */
	protected onFocus() {
		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected onBlur() {
		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected pickFile() {
		if ( this.isPopupOpened ) {
			return;
		}

		this.isPreventOnBlur = true;

		this._filePickerPopupRef
			= this
			._filePickerService
			.pick(
				{
					onPicked:
						this._onFilePicked,
					onClosed:
						this._onClosed,
				},
				{
					restoreFocus:
						this
						.formField
						?.container,
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

		this.isPreventOnBlur = true;

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( this.data ),
					removable:
						!this.readonly,
					previewingIndex:
						idx,
					onDone:
						this._onDone,
					onClosed:
						this._onClosed,
				},
				{
					restoreFocus:
						this
						.formField
						.container,
				}
			);
	}

	/**
	 * @param {AttachmentData} data
	 * @return {void}
	 */
	protected manageFiles( data: AttachmentData ) {
		if ( this.isPopupOpened ) {
			return;
		}

		this.isPreventOnBlur = true;

		this._fileManagerPopupRef
			= this
			._fileManagerService
			.manage(
				{
					files:
						_.cloneDeep( data ),
					readonly:
						this.readonly,
					onDone:
						this._onDone,
					onClosed:
						this._onClosed,
				},
				{
					restoreFocus:
						this
						.formField
						.container,
				}
			);
	}

	private _onFilePicked = (
		e: CUBFilePickerPickedEvent
	) => {
		const data: AttachmentData
			= ( this.data as any )?.valueType
				? _.cloneDeep( ( this.data as any ).data ) || []
				: _.cloneDeep( this.data ) || [];

		data.unshift( ...e.files );

		this.onDataChanged( data );
	};

	private _onClosed = () => {
		this.isPreventOnBlur = false;

		this.cdRef.markForCheck();
	};

	private _onDone = (
		data: AttachmentData
	) => {
		this.onDataChanged( data );
	};

}
