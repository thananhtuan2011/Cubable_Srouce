import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	inject,
	ViewChild,
	OnInit,
	TemplateRef,
	Optional,
	OnDestroy
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	NetworkService,
	untilCmpDestroyed
} from '@core';

import {
	CUBFile,
	CUBFileSource,
	CUBGoogleDriveFile,
	CUB_GOOGLE_CLIENT_ID
} from '@cub/material/file-picker';
import {
	CUBDialogDirection,
	CUBDialogService
} from '@cub/material/dialog';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastPosition,
	CUBToastService
} from '@cub/material/toast';
import {
	CUBPopupRef,
	CUB_POPUP_REF,
	CUB_POPUP_CONTEXT,
	CUBPopupService
} from '@cub/material/popup';
import {
	CUBFilePickerInside
} from '@cub/material/file-picker/file-picker/file-picker.inside';

import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	FieldExtra
} from '@main/common/field/interfaces';

import {
	FileExtension,
	LOADING_PERCENTAGE_DEFAULT,
	fieldTypeNotSupport
} from '../resources';
import {
	InfoSheet,
	IFieldsExcel,
	PopupImportContext,
	DataPreview
} from '../interfaces';
import {
	ImportService
} from '../services';

import {
	DialogPreviewComponent
} from './dialog-preview.component';

let GOOGLE_ACCESS_TOKEN: string;
declare const gapi: any;
declare const google: any;
@Component({
	selector: 'popup-import',
	templateUrl	: '../templates/popup-import.pug',
	styleUrls : [ '../styles/popup-import.scss', '../styles/toast.scss' ],
	host: { class: 'popup-import' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PopupImportComponent
	extends CUBFilePickerInside
	implements OnInit, OnDestroy {

	@ViewChild( 'toastLoading' )
	private _toastLoading: TemplateRef<any>;
	@ViewChild( 'toastSuccess' )
	private _toastSuccess: TemplateRef<any>;
	@ViewChild( 'toastFail' )
	private _toastFail: TemplateRef<any>;

	protected readonly loadingPercentageDefault: number
		= LOADING_PERCENTAGE_DEFAULT;
	protected readonly sheetsControl: FormControl
		= new FormControl( undefined );

	protected currentFile: CUBFile;
	protected typePopup: number;
	protected boardID: string;
	protected isNetWorkErr: boolean;
	protected fields: FieldExtra[];
	protected idShowPreview: boolean = true;
	protected fieldsExcel: IFieldsExcel[] = [];
	protected infoSheet: InfoSheet;
	protected dataPreview: DataPreview;
	protected isLoading: boolean = false;

	private _fileExt: string;
	private _inputEle: HTMLInputElement;
	private _toasts: Map<any, ULID>;

	get mimeTypes(): string {
		if ( this.fileAccept ) {
			return this.fileAccept as string;
		}

		if ( this.imageOnly ) {
			return 'image/*';
		}
	}

	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _cubToastService: CUBToastService
		= inject( CUBToastService );
	private readonly _cubDialogService: CUBDialogService
		= inject( CUBDialogService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _importService: ImportService
		= inject( ImportService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _networkService: NetworkService
		= inject( NetworkService );

	/**
	 * @constructor
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: PopupImportContext,
		@Optional() @Inject( CUB_GOOGLE_CLIENT_ID )
		protected readonly GOOGLE_CLIENT_ID: string
	) {
		super();

		if(
			this.popupContext
		) {
			this.boardID = this.popupContext.boardID;
		}
	}

	ngOnInit() {
		this.typePopup = 1;

		this._networkFailCatcher();
	}

	ngOnDestroy() {
		this._importService.destroyWorker(
			this._fileExt
		);
	}

	/**
	 * @return {HTMLInputElement}
	 */
	private _createHTMLInputElement(): HTMLInputElement {
		const input: HTMLInputElement
			= document.createElement( 'input' );

		input.setAttribute(
			'type',
			'file'
		);

		input.setAttribute(
			'accept',
			'.csv, .xlsx'
		);

		input.onchange
			= ( e: InputEvent ) => {
				this._onPickedDesktop(
					( e.target as HTMLInputElement ).files
				);

				input.value = '';
			};
		return this._inputEle = input;
	}

	/**
	 * @return {void}
	 */
	protected pickFileDesktop() {
		const inputEle: HTMLInputElement
			= this._inputEle
				|| this._createHTMLInputElement();
		inputEle.click();
	}

	/**
	 * @return {void}
	 */
	protected pickFileGoggleSheet(){
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
						callback: (
							{
								error,
								access_token: accessToken,
							}: any
						) => {
							if (
								error
								|| !accessToken
							) {
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
	 * @param {FileList} fileList
	 * @return {void}
	 */
	private _onPickedDesktop(
		fileList: FileList
	) {
		_.forEach(
			Array.from( fileList ),
			( file: File ) => {
				this._fileExt
					= ( file.name.split('.').pop() as string);

				this.currentFile = this.addFile(
					{
						filename: file.name,
						mimeType: file.type,
						size: file.size,
						url: URL.createObjectURL( file ),
						source: CUBFileSource.Local,
						metadata: file,
					} as CUBFile
				);
			}
		);

		if(this.currentFile){
			this._showToastLoading();
			this._handleReadFile();
		}

		this.cdRef.markForCheck();
	}

	/**
	 * @param {CUBGoogleDriveFile} files
	 * @return {void}
	 */
	private _onPickedGoggleSheet(
		files: CUBGoogleDriveFile[]
	) {
		this._fileExt = FileExtension.SPREADSHEET;

		_.forEach(
			files,
			( file: CUBGoogleDriveFile ) => {
				this.currentFile = this.addFile(
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

		if(
			this.currentFile
		) {
			this._showToastLoading();
			this._handleReadFile();
		}

		this.cdRef.markForCheck();
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
				.SPREADSHEETS
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
				if (
					e[ google.picker.Response.ACTION ]
						!== google.picker.Action.PICKED
				) {
					return;
				}

				this._onPickedGoggleSheet(
					e[ google.picker.Response.DOCUMENTS ]
				);
			})
			.build();

		picker.setVisible( true );
	}

	/***
	 * @return {void}
	 */
	private async _handleReadFile() {
		try {
			this.typePopup = -1;

			await this._importService.handleReadFile(
				this._fileExt,
				this.currentFile
			);

			this.infoSheet = this._importService.infoSheet;
			this.typePopup = 2;
		} catch (
			error
		) {
			this.popupRef.close();
			this._showToastFail();
			this.typePopup = -1;
		} finally {
			this._hideToastLoading();
			this.cdRef.markForCheck();
		}
	}

	// ************************************************************
	// CHOOSE FILE IMPORT
	// ************************************************************

	/**
	 * @param {string} sheetName
	 * @return {void}
	 */
	protected async onSheetChange(sheetName: string) {
		if(
			this.infoSheet.sheets.length === 1
			|| sheetName === this.infoSheet.currentSheet
		) return;

		this.infoSheet.currentSheet = sheetName;

		await this._importService.getCurrentSheet(
			this._fileExt, this.infoSheet.currentSheet
		);
		this.infoSheet = this._importService.infoSheet;
		this.cdRef.markForCheck();
	}

	/***
	* @return {void}
	*/
	protected async onContinue() {
		if (
			this.infoSheet.isError
		) return;

		this._getFieldsFromBoard();

		this.typePopup = -1;

		this._showToastLoading();

		await this.onSheetChange( this.infoSheet?.currentSheet );

		setTimeout(
			()=> {
				this.popupRef.close();
				this._hideToastLoading();
				this.idShowPreview && this._showToastPreview();
			},
			300
		);
	}

	/**
	 * @return {void}
	 */
	private async _handleMapFields() {
		if( this.fields.length > 0 ) {
			this.fieldsExcel
				= this._importService.mapFields(
					this.fields,
					this._importService.initFields(),
					'new'
				);

			this.dataPreview
				= await this._importService.getDataPreview(
					this.fields,
					this.fieldsExcel
				);
		}
	}

	// ************************************************************
	// HANDLE API
	// ************************************************************

	/**
	 * @return {void}
	 */
	private _getFieldsFromBoard() {
		this._boardFieldService
		.get( this.boardID, true )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				if(!fields) return;
				this.fields = _.filter(
					fields,
					( field: BoardField ) =>
						!fieldTypeNotSupport.has( field.dataType )
				);
				this._handleMapFields();
			},
		});
	}

	// ************************************************************
	// OTHER
	// ************************************************************

	/**
	 * @return {void}
	 */
	private _networkFailCatcher() {
		this._networkService
		.detectOnline()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( isOnline: boolean ) => {
			if ( !isOnline ) {
				this.isNetWorkErr = true;
				this._showToastFail();
				this.typePopup = -1;
			} else {
				this.isNetWorkErr = false;
			}
		}
		);
	}

	// ************************************************************
	// HANDLE EVENT TOAST, POPUP, DIALOG...
	// ************************************************************

	/**
	 * @param {TemplateRef<any>} templateKey
	 * @param {boolean=} hasConfirm
	 * @return {void}
	 */
	protected onCloseToast(
		templateKey: TemplateRef<any>,
		hasConfirm: boolean = true
	) {
		if (
			!hasConfirm
		) {
			this._cancelToastPreview(
				this._toasts.get( templateKey.elementRef.nativeElement )
			);
			return;
		}

		this._cubConfirmService
		.open(
			`BASE.BOARD.IMPORT.MESSAGE.CANCEL_MESSAGE`,
			'BASE.BOARD.IMPORT.MESSAGE.LOST_CURRENT_PROGRESS',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.BOARD.IMPORT.LABEL.CONFIRM_CANCEL',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.BOARD.IMPORT.LABEL.KEEP',
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this._cancelToastPreview(
					this._toasts.get( templateKey.elementRef.nativeElement )
				);
				this.popupRef.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onOpen() {
		if(this.isNetWorkErr) return;
		this._hideToastLoading();

		this._cubDialogService
		.open(
			DialogPreviewComponent,
			{
				boardID: this.boardID,
				fields: this.fields,
				fieldsExcel: this.fieldsExcel,
				dataPreview: this.dataPreview,
			},
			{
				direction: CUBDialogDirection.Vertical,
				overlayConfig: {
					hasBackdrop: true,
				},
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected openPopupImport() {
		this._popupService.open(
			null,
			PopupImportComponent,
			{
				boardID: this.boardID,
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);

		this._cubToastService.closeAll();
	}

	/**
	 * @return {void}
	 */
	private _showToastPreview(){
		if ( this.isNetWorkErr ) return;

		this._toasts ||= new Map();

		this._toasts.set(
			this._toastSuccess.elementRef.nativeElement,
			this._cubToastService
			.success(
				this._toastSuccess,
				{
					canClose: false,
					position: CUBToastPosition.BottomRight,
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _showToastLoading() {
		if( this.isNetWorkErr ) return;

		this.isLoading = true;

		this._toasts ||= new Map();

		this._toasts.set(
			this._toastLoading.elementRef.nativeElement,
			this._cubToastService
			.info(
				this._toastLoading,
				{
					canClose: false,
					position: CUBToastPosition.BottomRight,
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _showToastFail() {
		this._toasts ||= new Map();

		this._toasts.set(
			this._toastFail.elementRef.nativeElement,
			this._cubToastService
			.danger(
				this._toastFail,
				{
					canClose: false,
					position: CUBToastPosition.BottomRight,
				}
			)
		);
	}

	/**
	 * @return {void}
	 */
	private _hideToastLoading() {
		this.isLoading = false;

		this._cubToastService.closeAll();
	}

	/**
	 * @param {ULID} toastID
	 * @return {void}
	 */
	private _cancelToastPreview(
		toastID: ULID
	) {
		this.isLoading = true;

		this._cubToastService.close(
			toastID
		);

		this._cubToastService
		.success(
			'BASE.BOARD.IMPORT.MESSAGE.DATA_LOADING_CANCEL',
			{
				position: CUBToastPosition.BottomRight,
			}
		);
	}

}
