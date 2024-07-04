import {
	IField
} from './field.interface';

export type TextData = string;

export interface ITextField
	extends IField<TextData> {}
