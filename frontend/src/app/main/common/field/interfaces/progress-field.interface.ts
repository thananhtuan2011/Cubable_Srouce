import {
	IField
} from './field.interface';

export type ProgressData
	= number;

export interface IProgressField
	extends IField<ProgressData> {
	startValue: ProgressData;
	endValue: ProgressData;
}
