import { WGCIAvatar } from '../../wgc-avatar';
import { WGCIFile } from '../../wgc-file-picker';
import { WGCIMember, WGCIMemberStatus } from '../../wgc-member-picker';

import { ICON_TYPE } from '../resources';

// import { Delta } from 'quill';
type Delta = any;

export type WGCIIconType = MapObjectValue<typeof ICON_TYPE>;

export interface WGCIComment extends WGCICommentContent {
	id: string;
	createdBy: string;
	replyTo: string;
	createdAt: string;
	updatedAt: string;
	user: { id: string; name: string; avatar: WGCIAvatar };
	editable?: boolean;
	isEdited?: boolean;
	totalReplies?: number;
	reactionCount?: number;
	replies?: WGCIReply[];
	reactions?: WGCICommentReaction[];
}

export type WGCIReply = Omit<WGCIComment, 'totalReplies' | 'replies'>;

export interface WGCICommentCreateEvent {
	comment: WGCIComment;
	comments: WGCIComment[];
}

export interface WGCICommentUpdateEvent {
	comment: WGCIComment;
	content: WGCICommentContent;
	oldContent: WGCICommentContent;
}

export interface WGCICommentDeleteEvent {
	comment: WGCIComment;
	comments: WGCIComment[];
}

export interface WGCICommentReaction {
	iconType: WGCIIconType;
	users: WGCIMember[];
}

export interface WGCIReactionUpdated {
	comment: WGCICommentExtra;
	userReactedType: WGCIIconType;
	reactedType?: WGCIIconType;
}

export interface WGCICommentExtra extends WGCIComment {
	highlight?: boolean;
	isReplying?: boolean;
	isShowLessReplies?: boolean;
	isHiddenReplies?: boolean;
	userReactedType?: WGCIIconType;
	repliedUserIDs?: string[];
	repliedUsers?: WGCIMember[];
}

export interface WGCICommentImageClickedEvent {
	images: string[];
	clickedIndex: number;
}

export interface WGCICommentContent {
	attachments?: WGCIFile[];
	images?: WGCIFile[];
	linkPreviews?: ObjectType[];
	mentions?: string[];
	content?: {
		content: Delta;
		html: string;
		text: string;
	};
}

// TEMP
export interface WGCIMention {
	id: string;
	value: string;
	link?: string;
	avatar?: WGCIAvatar;
	status?: WGCIMemberStatus;
}
