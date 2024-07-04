import { WGCIComment, WGCICommentReaction } from '@wgc/wgc-comment';

export interface IComment extends WGCIComment {
	loadedAllReplies?: boolean;
}

export interface IReaction {
	id: string;
	updatedAt: string;
	reactionCount: number;
	reactions: WGCICommentReaction[];
}
