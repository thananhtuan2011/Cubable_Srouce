import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import {
	createProgressSVG,
	percent
} from '@cub/material/slider';

import {
	ProgressField
} from '@main/common/field/objects';
import {
	ProgressData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

@Component({
	selector: 'progress-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			progress-field-cell
			progress-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressFieldCellLiteComponent
	extends FieldCellLite<ProgressData>
	implements OnChanges, OnInit {

	@Input() public field: ProgressField;

	protected progressDom: string;
	protected percentage: string;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.field || changes.data ) {
			this.percentage = _.toPercent(
				percent(
					this.data,
					this.field.startValue,
					this.field.endValue
				),
				0,
				true
			) as string;
		}
	}

	ngOnInit() {
		this.progressDom = createProgressSVG();
	}

}
