import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import {
	EmojiPipe
} from '@core';

import {
	RatingField
} from '@main/common/field/objects';
import {
	RatingData
} from '@main/common/field/interfaces';

import {
	FieldCellLite
} from '../field-cell-lite';

const emojiPipe: EmojiPipe = new EmojiPipe();
// eslint-disable-next-line @typescript-eslint/typedef
const createRatingDOM = _.memoize(
	function(
		curr: number,
		max: number,
		unified: string
	): string {
		const container: HTMLDivElement
			= document.createElement( 'div' );

		for (
			let i: number = 0;
			i < Math.max( curr, max );
			i++
		) {
			const span: HTMLSpanElement
				= document.createElement( 'span' );

			span.style.opacity
				= String( i < curr ? 1 : .35 );
			span.innerText
				= emojiPipe.transform( unified );

			container.appendChild( span );
		}

		return container.innerHTML;
	},
	function(
		curr: number,
		max: number,
		unified: string
	): string {
		return `${curr}|${max}|${unified}`;
	}
);

@Component({
	selector: 'rating-field-cell-lite',
	templateUrl: './cell-lite.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			rating-field-cell
			rating-field-cell-lite
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingFieldCellLiteComponent
	extends FieldCellLite<RatingData>
	implements OnChanges {

	@Input() public field: RatingField;

	protected ratingDOM: string;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.field || changes.data ) {
			this.ratingDOM = createRatingDOM(
				this.data,
				this.field.maxPoint,
				this.field.emoji
			);
		}
	}

}
