import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	forwardRef,
	inject,
	Output
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	ValueType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

import {
	CUBParagraphEditorParseOutput
} from '@cub/material/editor';
import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	ParagraphData
} from '../../../../interfaces';
import {
	ParagraphField
} from '../../../../objects';

import {
	RichTextEditorService
} from '../../../editor/components';

import {
	FieldInput
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Unsubscriber()
@Component({
	selector: 'paragraph-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'paragraph-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [{
		multi: true,
		provide: FieldInput,
		useExisting: forwardRef(
			() => ParagraphFieldInputComponent
		),
	}],
})
export class ParagraphFieldInputComponent
	extends FieldInputEditable<ParagraphField, ParagraphData> {

	@Output() public richTextEditorOpened:
		EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public richTextEditorClosed:
		EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected isRichTextEditorOpened: boolean;

	private readonly _richTextEditorService:
		RichTextEditorService
		= inject( RichTextEditorService );

	/**
	 * @param {KeyboardEvent} e
	 * @return {void}
	 */
	protected onKeydown(
		e: KeyboardEvent,
		data: ParagraphData
	) {
		if (
			this.readonly
			|| e.code !== 'Backspace'
			|| (
				( data as any )?.valueType
				&& ( data as any ).valueType !== ValueType.STATIC
			)
		) {
			return;
		}

		this.onDataChanged( null );
	}

	/**
	 * @param {string} text
	 * @return {void}
	 */
	protected onTextChanged(
		text: string
	) {
		let data: ParagraphData = null;

		if ( text.length ) {
			data = { text };
		}

		this.onDataChanged( data );
	}

	/**
	 * @param {ParagraphData} data
	 * @return {void}
	 */
	protected openEditor( data: ParagraphData ) {
		if (
			!this
			.field
			.isRichTextFormatting
				|| this.isRichTextEditorOpened
		) {
			return;
		}

		const popupRef: CUBPopupRef
			= this
			._richTextEditorService
			.open(
				data,
				this.readonly,
				this._onRichTextEditorSaved
			);

		popupRef
		.afterOpened()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.isRichTextEditorOpened = true;

			this
			.richTextEditorOpened
			.emit();
		});

		popupRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.isRichTextEditorOpened = false;

			this
			.richTextEditorClosed
			.emit();
		});
	}

	private _onRichTextEditorSaved = (
		output: CUBParagraphEditorParseOutput
	) => {
		this.onDataChanged( output );

		this.cdRef.markForCheck();
	};

}
