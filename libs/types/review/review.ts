import { ReviewStatus } from '../../enums/review.enum';
import { Member } from '../member/member';

export interface Review {
	_id: string;
	memberId: string;
	propertyId: string;
	orderId: string;
	reviewRating: number;
	reviewContent: string;
	reviewImages: string[];
	reviewStatus: ReviewStatus;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface ReviewSummary {
	averageRating: number;
	totalReviews: number;
}

export interface Reviews {
	list: Review[];
	metaCounter: { total: number }[];
}

export interface CreateReviewInput {
	propertyId: string;
	orderId: string;
	reviewRating: number;
	reviewContent: string;
	reviewImages?: string[];
}

export interface ReviewsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search: { propertyId: string };
}
