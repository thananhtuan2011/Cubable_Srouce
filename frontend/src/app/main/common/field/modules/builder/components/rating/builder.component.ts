import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';
import _ from 'lodash';

import {
	RatingField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'rating-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'rating-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingFieldBuilderComponent
	extends FieldBuilder<RatingField> {

	protected internalField: RatingField;

	/**
	 * @param {number} maxPoint
	 * @return {void}
	 */
	protected onMaxPointChanged(
		maxPoint: number
	) {
		if ( maxPoint >= this.initialData
			|| _.isStrictEmpty( this.initialData ) ) {
			return;
		}

		this.onInitialDataChanged(
			this.initialData = maxPoint
		);
	}

}
