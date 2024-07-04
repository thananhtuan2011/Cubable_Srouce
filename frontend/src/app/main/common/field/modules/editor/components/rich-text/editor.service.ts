import {
	inject,
	Injectable
} from '@angular/core';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';
import {
	CUBParagraphEditorData
} from '@cub/material/editor';

import {
	ParagraphData
} from '../../../../interfaces';

import {
	RichTextEditorContext,
	RichTextEditorComponent
} from './editor.component';

type OnSavedFn
	= RichTextEditorContext[ 'onSaved' ];
type OnCancelledFn
	= RichTextEditorContext[ 'onCancelled' ];

@Injectable()
export class RichTextEditorService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {ParagraphData} paragraphData
	 * @param {boolean=} readonly
	 * @param {OnSavedFn=} onSaved
	 * @param {OnCancelledFn=} onCancelled
	 * @param {Partial<RichTextEditorContext>=} context
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public open(
		paragraphData: ParagraphData,
		readonly?: boolean,
		onSaved?: OnSavedFn,
		onCancelled?: OnCancelledFn,
		context?: Partial<RichTextEditorContext>,
		config?: CUBPopupConfig
	): CUBPopupRef {
		let data: CUBParagraphEditorData;
		let raw: string;

		if ( paragraphData ) {
			data = paragraphData.data;
			raw = paragraphData.html
				|| paragraphData.text;
		}

		return this
		._popupService
		.open(
			null,
			RichTextEditorComponent,
			{
				...context,

				data,
				raw,
				readonly,
				onSaved,
				onCancelled,
			},
			{
				hasBackdrop: 'transparent',
				disableClose: true,

				...config,
			}
		);
	}

}
