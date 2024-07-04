import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input
} from '@angular/core';

import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	ParagraphData
} from '@main/common/field/interfaces';
import {
	ParagraphField
} from '@main/common/field/objects';
import {
	RichTextEditorService
} from '@main/common/field/modules/editor/components';

import {
	CellTouchEvent
} from '../field-cell-touchable';
import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'paragraph-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			paragraph-field-cell
			paragraph-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphFieldCellFullComponent
	extends FieldCellInputable<ParagraphData> {

	@Input() public field: ParagraphField;

	private readonly _richTextEditorService: RichTextEditorService
		= inject( RichTextEditorService );

	private _richTextEditorPopupRef: CUBPopupRef;

	/**
	 * @param {CellTouchEvent} e
	 * @return {void}
	 */
	protected override onTouch( e: CellTouchEvent ) {
		if ( this.readonly ) return;

		this.field.isRichTextFormatting
			? this.openRichTextEditor()
			: this.input( e );
	}

	/**
	 * @param {InputBoxContent} content
	 * @return {void}
	 */
	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		content = content as string;

		let data: ParagraphData = null;

		if ( content.length ) {
			data = this.data
				|| {} as ParagraphData;

			data.text
				= data.html
				= content;
		}

		this.save( data );
	}

	/**
	 * @return {void}
	 */
	protected openRichTextEditor() {
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
				this.data,
				this.readonly,
				this.save.bind( this ),
				undefined,
				undefined,
				{
					restoreFocus:
						this.elementRef,
				}
			);
	}

}
