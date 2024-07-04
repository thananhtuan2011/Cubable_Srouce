import {
	CalculatingType
} from '../helpers/calculate';

export type CalculatingMetadata = {
	label: string;
	value: CalculatingType;
};

function getCalculatingMetadata(
	type: CalculatingType,
	label: string
): CalculatingMetadata {
	return {
		label: `SPREADSHEET.LABEL.${label}`,
		value: CalculatingType[type],
	};
};

export const CALCULATIONS_TYPE:
ReadonlyMap<CalculatingType, CalculatingMetadata>
	= new Map([
		[
			CalculatingType.Empty,
			getCalculatingMetadata(
				CalculatingType.Empty,
				'EMPTY'
			),
		],
		[
			CalculatingType.Filled,
			getCalculatingMetadata(
				CalculatingType.Filled,
				'FILLED'
			),
		],
		[
			CalculatingType.Unique,
			getCalculatingMetadata(
				CalculatingType.Unique,
				'UNIQUE'
			),
		],
		[
			CalculatingType.PercentEmpty,
			getCalculatingMetadata(
				CalculatingType.PercentEmpty,
				'PERCENT_EMPTY'
			),
		],
		[
			CalculatingType.PercentFilled,
			getCalculatingMetadata(
				CalculatingType.PercentFilled,
				'PERCENT_FILLED'
			),
		],
		[
			CalculatingType.PercentUnique,
			getCalculatingMetadata(
				CalculatingType.PercentUnique,
				'PERCENT_UNIQUE'
			),
		],
		[
			CalculatingType.Min,
			getCalculatingMetadata(
				CalculatingType.Min,
				'MIN'
			),
		],
		[
			CalculatingType.Max,
			getCalculatingMetadata(
				CalculatingType.Max,
				'MAX'
			),
		],
		[
			CalculatingType.DayRange,
			getCalculatingMetadata(
				CalculatingType.DayRange,
				'DAY_RANGE'
			),
		],
		[
			CalculatingType.MonthRange,
			getCalculatingMetadata(
				CalculatingType.MonthRange,
				'MONTH_RANGE'
			),
		],

		[
			CalculatingType.Sum,
			getCalculatingMetadata(
				CalculatingType.Sum,
				'SUM'
			),
		],
		[
			CalculatingType.Average,
			getCalculatingMetadata(
				CalculatingType.Average,
				'AVERAGE'
			),
		],
		[
			CalculatingType.Median,
			getCalculatingMetadata(
				CalculatingType.Median,
				'MEDIAN'
			),
		],
		[
			CalculatingType.Range,
			getCalculatingMetadata(
				CalculatingType.Range,
				'RANGE'
			),
		],
	]);
