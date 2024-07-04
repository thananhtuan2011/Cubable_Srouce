import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Inject,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	isObservable,
	Subject
} from 'rxjs';

import {
	CUBConfirmService,
	CUBIConfirmRef
} from '@cub/material/confirm';
import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBIPopupInstance,
	CUBPopupRef
} from '@cub/material/popup';

import {
	CUBFile,
	CUBFileSource
} from '../file/file.component';

import {
	CUBFilePickerInside
} from './file-picker.inside';

export type CUBFilePickerContext = {
	authorizedKey?: string;
	fileAccept?: string | string[];
	imageOnly?: boolean;
	multiSelect?: boolean;
	onPicked?: ( e: CUBFilePickerPickedEvent ) => void;
	onClosed?: () => void;
};

export type CUBFilePickerPickedEvent = {
	files: CUBFile[];
	source: CUBFileSource;
};

type OnBeforeCloseReturnType
	= ReturnType<CUBIPopupInstance[ 'onBeforeClose' ]>;

@Component({
	selector: 'cub-file-picker',
	templateUrl: './file-picker.pug',
	styleUrls: [ './file-picker.scss' ],
	host: { class: 'cub-file-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFilePickerComponent
implements CUBIPopupInstance {

	@ViewChild( CUBFilePickerInside )
	protected readonly filePickerInside: CUBFilePickerInside;

	protected authorizedKey: string;
	protected fileAccept: string | string[];
	protected imageOnly: boolean;
	protected multiSelect: boolean = true;

	// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/naming-convention
	protected readonly CUBFileSource
		= CUBFileSource;

	protected source: CUBFileSource
		= CUBFileSource.Local;

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {CUBFilePickerContext} popupContext
	 */
	constructor(
		@Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Inject( CUB_POPUP_CONTEXT )
		protected popupContext: CUBFilePickerContext
	) {
		this.fileAccept
			= this.popupContext.fileAccept;
		this.imageOnly
			= this.popupContext.imageOnly;
		this.multiSelect
			= this.popupContext.multiSelect
				?? this.multiSelect;
		this.authorizedKey
			= this.popupContext.authorizedKey;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onBeforeClose(): OnBeforeCloseReturnType {
		return this._canContinue();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onClosed() {
		this
		.popupContext
		.onClosed?.();
	}

	/**
	 * @param {CUBFileSource} source
	 * @return {void}
	 */
	protected selectPicker(
		source: CUBFileSource
	) {
		const callback: () => void
			= () => this.source = source;
		const r: OnBeforeCloseReturnType
			= this._canContinue( callback );

		if ( !r
			|| isObservable( r ) ) {
			return;
		}

		callback();
	}

	/**
	 * @param {CUBFile[]} files
	 * @return {void}
	 */
	protected onPicked(
		files: CUBFile[]
	) {
		this
		.popupContext
		.onPicked?.({
			files,
			source: this.source,
		});

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected onCancelled() {
		this.popupRef.close();
	}

	/**
	 * @param {Function=} callback
	 * @return {void}
	 */
	private _canContinue(
		callback?: () => void
	): OnBeforeCloseReturnType {
		const {
			pickedFiles,
		}: CUBFilePickerInside
			= this.filePickerInside;
		const isContinue: boolean
			= !pickedFiles
				|| pickedFiles.length === 0;

		if ( !isContinue ) {
			const $: Subject<boolean>
				= new Subject<boolean>();
			const confirmRef: CUBIConfirmRef
				= this
				._confirmService
				.open(
					'CUB.MESSAGE.LOSE_YOUR_CURRENT_PROCESS_CONFIRM',
					'CUB.LABEL.LOSE_YOUR_CURRENT_PROCESS',
					{
						warning: true,
						buttonApply: 'CUB.LABEL.CONFIRM_CANCEL',
						buttonDiscard: 'CUB.LABEL.KEEP',
					}
				);

			confirmRef
			.afterClosed()
			.subscribe(
				( answer: boolean ) => {
					if ( answer ) {
						callback?.();
					}

					$.next( answer );
					$.complete();
				}
			);

			return $.asObservable();
		}

		return isContinue;
	}

}
