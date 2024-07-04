import {
	IField
} from './field.interface';

export type EmailData
	= string;

export interface IEmailField
	extends IField<EmailData> {}
