import {
	ChangeDetectionStrategy,
	Component,
	inject
} from '@angular/core';

import {
	CUBPopupRef
} from '@cub/material/popup';

import {
	LinkData
} from '@main/common/field/interfaces';
import {
	LinkEditorService
} from '@main/common/field/modules/editor/components';

import {
	FieldCellInputable
} from '../field-cell-inputable';
import {
	InputBoxContent
} from '../input-box.component';

@Component({
	selector: 'link-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [
		'../field-cell.scss',
		'../field-cell-inputable.scss',
	],
	host: {
		class: `
			link-field-cell
			link-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkFieldCellFullComponent
	extends FieldCellInputable<LinkData> {

	private readonly _linkEditorService: LinkEditorService
		= inject( LinkEditorService );

	private _linkEditorPopupRef: CUBPopupRef;

	protected override onDetach() {
		super.onDetach();

		this
		._linkEditorPopupRef
		?.close();
	}

	protected override onInputBoxEdited(
		content: InputBoxContent
	) {
		content = content as string;

		let data: LinkData = null;

		if ( content.length ) {
			data = this.data
				|| {} as LinkData;

			data.link = content;
		}

		this.save( data );
	}

	protected openLinkEditorPopup() {
		if (
			this
			._linkEditorPopupRef
			?.isOpened
		) {
			return;
		}

		this._linkEditorPopupRef
			= this
			._linkEditorService
			.open(
				this.elementRef,
				{ ...this.data },
				this.readonly,
				this.save.bind( this ),
				undefined,
				undefined,
				{
					position: 'start-below',
					restoreFocus: 'origin',
				}
			);
	}

}
