import {
	IField
} from './field.interface';

export type LinkData = {
	link: string;
	text?: string;
};

export interface ILinkField
	extends IField<LinkData> {}
