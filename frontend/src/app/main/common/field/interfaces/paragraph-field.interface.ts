import {
	CUBParagraphEditorData
} from '@cub/material/editor';

import {
	IField
} from './field.interface';

export type ParagraphData = {
	text: string;
	html?: string;
	data?: CUBParagraphEditorData;
};

export interface IParagraphField
	extends IField<ParagraphData> {
	isRichTextFormatting?: boolean;
}
