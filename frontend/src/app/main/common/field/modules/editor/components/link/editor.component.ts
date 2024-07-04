import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	inject,
	OnInit,
	Optional
} from '@angular/core';
import {
	FormBuilder,
	FormGroup
} from '@angular/forms';

import {
	CUB_POPUP_REF,
	CUB_POPUP_CONTEXT,
	CUBPopupRef
} from '@cub/material/popup';

import {
	LinkData
} from '@main/common/field/interfaces';

export type LinkEditorContext = {
	data: LinkData;
	readonly?: boolean;
	onEdited?: ( data: LinkData ) => void;
	onCancelled?: () => void;
};

@Component({
	selector: 'link-editor',
	templateUrl: './editor.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkEditorComponent implements OnInit {

	protected form: FormGroup;
	protected data: LinkData;
	protected readonly: boolean;

	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {LinkEditorContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: LinkEditorContext
	) {
		this.data
			= popupContext.data
				|| {} as LinkData;
		this.readonly
			= popupContext.readonly;
	}

	ngOnInit() {
		this.form
			= this._fb.group({
				text: undefined,
				link: undefined,
			});
	}

	/**
	 * @return {void}
	 */
	protected submit() {
		this
		.popupContext
		.onEdited?.( this.data );

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		this
		.popupContext
		.onCancelled?.();

		this.popupRef.close();
	}

}
