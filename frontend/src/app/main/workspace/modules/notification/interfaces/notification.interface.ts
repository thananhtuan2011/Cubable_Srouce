/* eslint-disable @typescript-eslint/naming-convention */
import {
	ULID
} from 'ulidx';

import {
	CUBAvatar
} from '@cub/material/avatar';
import {
	CUBFile
} from '@cub/material/file-picker';
import {
	CUBBasicEditorContent
} from '@cub/material/editor';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';

export enum NotificationAction {
	COMMENT_MENTION = 1,
	REPLY_MENTION = 2,
	REPLY_COMMENT = 3,
	REPLY_COMMENT_HAS_MENTION = 4,
	REPLY_HAS_REPLY_MENTION = 5,
	REPLY_HAS_REPLY = 6,
	USER_SETUP = 7,
}

export enum TabType {
	ALL = 0,
	UN_READ,
	RELATE_COMMENT,
}

export enum NotificationType {
	WORKFLOW = 1,
	COMMENT = 2
}

export type NotificationCount = {
	newNotification?: number;
	total?: number;
	unRead?: number;
	relatedComment?: number;
};

export type Notification = {
	id: ULID;
	userID: ULID;
	commentID: ULID;
	read: boolean;
	isNew: boolean;
	createdAt: string;
	updatedAt: string;
	actionType: NotificationAction;
	type: NotificationType;
	from: IUser;
	metadata: {
		baseID: ULID;
		boardID: ULID;
		recordID: ULID;
		title: string;
		content: CUBBasicEditorContent;
		permissionOnBoard: boolean;
		permissionOnPrimaryField: boolean;
		baseName: string;
		itemName: string;
		userName: string;
		boardName: string;
		recordName: string;
		avatar: CUBAvatar;
		files?: CUBFile;
	};
};
