import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	LinkData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'link-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			link-field-cell
			link-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkFieldCellLiteComponent
	extends FieldCellLite<LinkData> {}
