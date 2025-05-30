import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common_enum';

export interface CommentInput {
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	memberId?: string;
}

interface CISearch {
	commentRefId: string;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: CISearch;
}
