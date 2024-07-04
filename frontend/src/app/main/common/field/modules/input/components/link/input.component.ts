import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	inject,
	ViewChild
} from '@angular/core';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';
import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	LinkData
} from '../../../../interfaces';
import {
	LinkField
} from '../../../../objects';

import {
	LinkEditorService
} from '../../../editor/components';

import {
	FieldInput
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Unsubscriber()
@Component({
	selector: 'link-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'link-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [{
		multi: true,
		provide: FieldInput,
		useExisting: forwardRef(
			() => LinkFieldInputComponent
		),
	}],
})
export class LinkFieldInputComponent
	extends FieldInputEditable<LinkField, LinkData> {

	@ViewChild(
		CUBFormFieldInputDirective,
		{ static: true }
	)
	protected readonly formFieldInput:
		CUBFormFieldInputDirective;

	private readonly _linkEditorService:
		LinkEditorService
		= inject( LinkEditorService );

	protected linkEditorPopupRef: CUBPopupRef;

	/**
	 * @param {string} link
	 * @param {LinkData} data
	 * @return {void}
	 */
	protected onLinkChanged(
		link: string,
		data: LinkData
	) {
		let _data: LinkData = null;

		if ( link.length ) {
			_data = { ...data, link };
		}

		this.onDataChanged( _data );
	}

	/**
	 * @param {MouseEvent} e
	 * @param {LinkData} data
	 * @return {void}
	 */
	protected openLinkEditorPopup(
		e: MouseEvent,
		data: LinkData
	) {
		if (
			this
			.linkEditorPopupRef
			?.isOpened
		) {
			return;
		}

		e.stopPropagation();

		this
		.formFieldInput
		.blur();

		this.linkEditorPopupRef
			= this
			._linkEditorService
			.open(
				e.target as HTMLElement,
				{ ...data },
				this.readonly,
				this._onLinkEdited,
				undefined,
				undefined,
				{
					position:
						'end-below',
					restoreFocus:
						this
						.formFieldInput
						.element,
				}
			);

		this
		.linkEditorPopupRef
		.afterClosed()
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this.cdRef.markForCheck();
		});
	}

	private _onLinkEdited = (
		data: LinkData
	) => {
		this.onDataChanged( data );
	};

}
