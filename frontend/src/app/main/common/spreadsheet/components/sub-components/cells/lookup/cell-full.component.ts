import {
	ChangeDetectionStrategy,
	Component,
	Input,
	inject
} from '@angular/core';
import _ from 'lodash';
import {
	ULID
} from 'ulidx';

import {
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';
import {
	CUBFile,
	CUBFilePreviewerService
} from '@cub/material/file-picker';

import {
	LookupField
} from '@main/common/field/objects';
import {
	DataType,
	FormulaResultFormatType,
	Operator,
	ParagraphData
} from '@main/common/field/interfaces';
import {
	BoardExpandService
} from '@main/workspace/modules/base/modules/board/services';
import {
	RecordData
} from '@main/workspace/modules/base/modules/board/modules/record/interfaces';
import {
	RichTextEditorService
} from '@main/common/field/modules/editor/components';
import {
	FormulaCalculatedType
} from '@main/common/field/resources';

import {
	ReferenceExpanderComponent
} from '../reference/reference-expander.component';
import {
	FieldCellTouchable
} from '../field-cell-touchable';

@Component({
	selector: 'lookup-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			lookup-field-cell
			lookup-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupFieldCellFullComponent
	extends FieldCellTouchable<any> {

	@Input() public field: LookupField;

	protected readonly DATA_TYPE: typeof DataType = DataType;
	protected readonly OPERATORS: typeof Operator = Operator;

	protected records: RecordData[];
	protected itemList: ULID[];

	protected readonly formulaCalculatedType: typeof FormulaCalculatedType
		= FormulaCalculatedType;
	protected readonly formulaResultFormatType: typeof FormulaResultFormatType
		= FormulaResultFormatType;

	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _boardExpandService: BoardExpandService
		= inject( BoardExpandService );
	private readonly _richTextEditorService: RichTextEditorService
		= inject( RichTextEditorService );

	private _filePreviewerPopupRef: CUBPopupRef;
	private _richTextEditorPopupRef: CUBPopupRef;

	get isPopupOpened(): boolean {
		return this._filePreviewerPopupRef?.isOpened;
	}

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	protected override onTouch(
		event: MouseEvent
	) {
		if ( event instanceof KeyboardEvent ) return;

		this.openExpander();
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

		let files: CUBFile[] = [];

		_.forEach( this.data?.selected, ( s: CUBFile[] ) => {
			if ( s === null ) return;

			files = [ ...files, ...s ];
		} );

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( files ),
					removable: true,
					previewingIndex:
						idx,
				},
				{
					restoreFocus:
						this.elementRef,
				}
			);
	}

	/**
	 * @param {ULID} _itemID
	 * @param {number} _index
	 * @return {void}
	 */
	protected openDialogItemDetail( _itemID: ULID, _index?: number ) {
		this._boardExpandService
		.openDialogItemDetail({
			itemID: _itemID,
			boardID: this.field.lookup.sourceBoardID,
			itemIDs: this.data?.value ? this.data.value : [],
			lookupContext: {
				...this.context.row,
				fieldID: this.field.id,
				sourceFieldID: this.field.lookup.sourceFieldID,
				index: _index,
			},
		});
	}

	/**
	 * @param {ParagraphData} data
	 * @return {void}
	 */
	protected openParagraphDetail( data: ParagraphData ) {
		if (
			this
			._richTextEditorPopupRef
			?.isOpened
		) {
			return;
		}

		this._richTextEditorPopupRef
			= this
			._richTextEditorService
			.open(
				data,
				true,
				undefined,
				undefined,
				undefined,
				{
					restoreFocus:
						this.elementRef,
				}
			);
	}

	/**
	 * @return {void}
	 */
	protected openExpander() {
		let _itemName: string;

		if ( this.context?.primaryColumn ) {
			_itemName = this.context.row.data[ this.context.primaryColumn.id ];
		}

		this._popupService.open(
			null,
			ReferenceExpanderComponent,
			{
				isExpand: true,
				readonly: true,
				lookupParams: {
					sourceFieldID: this.field.lookup.sourceFieldID,
					sourceBoardID: this.field.lookup.sourceBoardID,
				},
				itemName: _itemName,
				itemIDs: this.data?.value
					? this.data?.value
					: [],
			},
			{
				hasBackdrop: 'transparent',
				disableClose: false,
			}
		);
	}

}
