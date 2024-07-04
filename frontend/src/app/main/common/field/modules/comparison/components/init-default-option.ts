import {
	DataType
} from '../../../interfaces';

import {
	ComparisonDefault
} from '../interfaces';
import {
	ComparisonOperator,
	ComparisonType
} from '../resources';

import {
	AttachmentComparisonComponent
} from './attachment/attachment-comparison.component';
import {
	ComparisonBase
} from './comparison-base';
import {
	FormulaComparisonComponent,
	FormulaDefault,
	FormulaType
} from './formula/formula-comparison.component';
import {
	LinkComparisonComponent
} from './link/link-comparison.component';
import {
	ParagraphComparisonComponent
} from './paragraph/paragraph-comparison.component';

export const getDefaultOptions = (
	dataType: DataType
): ComparisonDefault => {
	let operator: ComparisonOperator;
	let compareType: ComparisonType;
	let formulaType: FormulaType;

	switch ( dataType ) {
		case DataType.Paragraph:
			operator = ParagraphComparisonComponent.default.operator;
			break;
		case DataType.Link:
			operator = LinkComparisonComponent.default.operator;
			break;
		case DataType.Attachment:
			operator = AttachmentComparisonComponent.default.operator;
			break;
		case DataType.Formula:
			const formulaDefault: FormulaDefault
				= FormulaComparisonComponent.getDefaultOption();

			operator = formulaDefault.operator;
			compareType = formulaDefault.compareType;
			formulaType = formulaDefault.formulaType;
			break;
		default:
			operator = ComparisonBase.default.operator;
			compareType = ComparisonBase.default.compareType;
			break;
	}

	return {
		operator,
		compareType,
		...(
			formulaType
				? { formulaType }
				: {}
		),
	};
};
