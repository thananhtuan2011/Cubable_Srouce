import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	Optional,
	ViewChild
} from '@angular/core';

import {
	CUBParagraphEditorComponent,
	CUBParagraphEditorData,
	CUBParagraphEditorParseOutput
} from '@cub/material/editor';
import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBPopupRef
} from '@cub/material/popup';

export type RichTextEditorContext = {
	data: CUBParagraphEditorData;
	raw?: string;
	readonly?: boolean;
	onSaved?: (
		output: CUBParagraphEditorParseOutput
	) => void;
	onCancelled?: () => void;
};

@Component({
	selector: 'rich-text-editor',
	templateUrl: './editor.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent {

	protected data: CUBParagraphEditorData;
	protected raw: string;
	protected readonly: boolean;

	@ViewChild( CUBParagraphEditorComponent )
	protected readonly editor: CUBParagraphEditorComponent;

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {RichTextEditorContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: RichTextEditorContext
	) {
		this.data
			= this.popupContext.data;
		this.raw
			= this.popupContext.raw;
		this.readonly
			= this.popupContext.readonly;
	}

	/**
	 * @return {void}
	 */
	public save() {
		this
		.popupContext
		.onSaved?.(
			this.editor.parse()
		);

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	public cancel() {
		this
		.popupContext
		.onCancelled?.();

		this.popupRef.close();
	}

}
