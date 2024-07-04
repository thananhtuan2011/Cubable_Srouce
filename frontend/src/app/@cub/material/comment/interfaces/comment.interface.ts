import {
	ULID
} from 'ulidx';

import {
	IUserStatus
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	CUBAvatar
} from '../../avatar';
import {
	CUBFile
} from '../../file-picker';
import { CUBBasicEditorContent } from '../../editor';

export type CUBComment = CUBCommentContent & {
	id: ULID;
	createdBy: ULID;
	createdAt: string;
	updatedAt: string;
	user: { id: ULID; name: string; avatar: CUBAvatar; status: IUserStatus };
	parentID?: ULID;
	editable?: boolean;
	amount?: number;
	replies?: CUBReply[];
};

export type CUBCommentContent = {
	message?: string;
	files?: CUBFile[];
	mentions?: ULID[];
	metadata?: CUBBasicEditorContent;
};

export type CUBReply = Omit<
	CUBComment,
	'amount' | 'replies'
>;

export type CUBCommentCreateEvent = {
	comment: CUBComment;
	comments: CUBComment[];
};

export type CUBCommentUpdateEvent = {
	comment: CUBComment;
	content: CUBCommentContent;
	oldContent: CUBCommentContent;
};

export type CUBCommentDeleteEvent = {
	comment: CUBComment;
	comments: CUBComment[];
};

export type CUBCommentExtra = CUBComment & {
	isEditing?: boolean;
	isReplying?: boolean;
	isShowAllReplies?: boolean;
};
