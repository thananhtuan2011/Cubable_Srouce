import {
	DateData,
	IDateField
} from './date-field.interface';

export type LastModifiedTimeData
	= DateData;

export interface ILastModifiedTimeField
	extends IDateField {
	targetFieldID?: string;
}
