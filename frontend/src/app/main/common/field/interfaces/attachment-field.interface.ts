import {
	CUBFile
} from '@cub/material/file-picker';

import {
	IField
} from './field.interface';

export type AttachmentFile
	= CUBFile;
export type AttachmentData
	= AttachmentFile[];

export interface IAttachmentField
	extends IField<AttachmentData> {}
