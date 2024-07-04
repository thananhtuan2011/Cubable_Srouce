import {
	ChangeDetectionStrategy,
	Component,
	inject
} from '@angular/core';

import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	ParagraphData
} from '../../../../interfaces';
import {
	ParagraphField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'paragraph-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'paragraph-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParagraphFieldBuilderComponent
	extends FieldBuilder<ParagraphField> {

	protected internalField: ParagraphField;
	protected initialData: ParagraphData
		= {} as ParagraphData;

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	/**
	 * @param {boolean} isRichTextFormatting
	 * @return {void}
	 */
	protected onFormatMethodChanged(
		isRichTextFormatting: boolean
	) {
		if ( isRichTextFormatting ) {
			this
			.internalField
			.isRichTextFormatting
				= isRichTextFormatting;
			return;
		}

		this._confirmService
		.open(
			'FIELD.BUILDER.MESSAGE.CHANGE_FORMAT_METHOD_CONFIRM',
			'FIELD.BUILDER.LABEL.CHANGE_FORMAT_METHOD',
			{
				warning: true,
				buttonApply: {
					text: 'FIELD.BUILDER.LABEL.CHANGE_TO_BASIC_METHOD',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe(( answer: boolean ) => {
			if ( !answer ) {
				this
				.internalField
				.isRichTextFormatting = null;

				this.cdRef.detectChanges();

				this
				.internalField
				.isRichTextFormatting = true;

				this.cdRef.markForCheck();
				return;
			};

			this
			.internalField
			.isRichTextFormatting
				= isRichTextFormatting;
		});
	}

	/**
	 * @return {void}
	 */
	protected onRichTextEditorOpened() {
		this
		.popupRef
		.disableClose();
	}

	/**
	 * @return {void}
	 */
	protected onRichTextEditorClosed() {
		this
		.popupRef
		.enableClose();
	}

}
