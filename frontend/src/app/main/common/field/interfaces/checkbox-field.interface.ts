import {
	IField
} from './field.interface';

export type CheckboxData
	= boolean;

export interface ICheckboxField
	extends IField<CheckboxData> {}
