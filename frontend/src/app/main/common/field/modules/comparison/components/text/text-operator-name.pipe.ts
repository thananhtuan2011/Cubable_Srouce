import {
	Pipe,
	PipeTransform
} from '@angular/core';
import _ from 'lodash';

import {
	Memoize
} from '@core';

import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources/comparison';

const COMPARISON_OPERATOR: Record<ComparisonOperator, string> = {
	[ ComparisonOperator.ANY ]: 'ANY',
	[ ComparisonOperator.IS_EMPTY ]: 'IS_EMPTY',
	[ ComparisonOperator.IS_NOT_EMPTY ]: 'IS_NOT_EMPTY',

	[ ComparisonOperator.IS_EXACTLY ]: 'IS_EXACTLY',
	[ ComparisonOperator.IS_NOT_EXACTLY ]: 'IS_NOT_EXACTLY',

	[ ComparisonOperator.CONTAINS ]: 'CONTAINS',
	[ ComparisonOperator.DOES_NOT_CONTAINS ]: 'DOES_NOT_CONTAINS',

	[ ComparisonOperator.STARTS_WITH ]: 'STARTS_WITH',
	[ ComparisonOperator.ENDS_WITH ]: 'ENDS_WITH',

	[ ComparisonOperator.WORD_COUNT_GREATER_THAN ]: 'TEXT.WORD_COUNT_GREATER_THAN',
	[ ComparisonOperator.WORD_COUNT_GREATER_THAN_OR_EQUAL ]: 'TEXT.WORD_COUNT_GREATER_THAN_OR_EQUAL',
	[ ComparisonOperator.WORD_COUNT_LESS_THAN ]: 'TEXT.WORD_COUNT_LESS_THAN',
	[ ComparisonOperator.WORD_COUNT_LESS_THAN_OR_EQUAL ]: 'TEXT.WORD_COUNT_LESS_THAN_OR_EQUAL',
	[ ComparisonOperator.WORD_COUNT_EQUAL ]: 'TEXT.WORD_COUNT_EQUAL',
} as Record<ComparisonOperator, string>;

@Pipe({
	name: 'textOperatorName',
})
export class TextOperatorNamePipe
implements PipeTransform {

	/**
	 * @param {ComparisonOperator} operator
	 * @return {string}
	 */
	@Memoize()
	public transform(
		operator: ComparisonOperator
	): string {
		if ( !operator ) return;

		return `FIELD.COMPARISON.OPERATOR.${COMPARISON_OPERATOR[ operator ]}`;
	}

}
