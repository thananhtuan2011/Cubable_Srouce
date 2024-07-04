import {
	IField
} from './field.interface';

export type RatingPoint
	= NumRange<11>;
export type RatingData
	= RatingPoint;

export interface IRatingField
	extends IField<RatingData> {
	maxPoint: RatingPoint;
	emoji: string;
}
