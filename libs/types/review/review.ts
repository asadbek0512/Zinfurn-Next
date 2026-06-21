import { ReviewReaction, ReviewStatus } from '../../enums/review.enum';
import { Member } from '../member/member';

export interface RatingCount {
	star: number;
	count: number;
}

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
	likesCount?: number;
	dislikesCount?: number;
	myReaction?: ReviewReaction | null;
	memberData?: Member;
}

export interface ReviewSummary {
	averageRating: number;
	totalReviews: number;
	ratingDistribution: RatingCount[];
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
