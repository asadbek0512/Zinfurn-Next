// @ts-nocheck
import React, { useState } from 'react';
import { Box, Button, Divider, Rating, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_PROPERTY_REVIEWS, GET_PROPERTY_REVIEW_SUMMARY } from '../../../apollo/user/query';
import { Review, ReviewSummary } from '../../types/review/review';
import { REACT_APP_API_URL } from '../../config';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';

interface ReviewSectionProps {
	propertyId: string;
}

const StarBar = ({ rating, total }: { rating: number; total: number }) => {
	const pct = total > 0 ? Math.round((rating / total) * 100) : 0;
	return (
		<div className="rev-bar-row">
			<span className="rev-bar-lbl">{rating}</span>
			<StarIcon sx={{ fontSize: 12, color: '#f5a623' }} />
			<div className="rev-bar-track">
				<div className="rev-bar-fill" style={{ width: `${pct}%` }} />
			</div>
			<span className="rev-bar-count">{rating}</span>
		</div>
	);
};

const ReviewSection = ({ propertyId }: ReviewSectionProps) => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState(1);
	const [photoFilter, setPhotoFilter] = useState(false);
	const [sortBy, setSortBy] = useState('createdAt');

	const { data: summaryData } = useQuery(GET_PROPERTY_REVIEW_SUMMARY, {
		variables: { propertyId },
		skip: !propertyId,
	});

	const { data, loading } = useQuery(GET_PROPERTY_REVIEWS, {
		variables: {
			input: {
				page,
				limit: 5,
				sort: sortBy,
				direction: 'DESC',
				search: { propertyId },
			},
		},
		skip: !propertyId,
		fetchPolicy: 'cache-and-network',
	});

	const summary: ReviewSummary = summaryData?.getPropertyReviewSummary || { averageRating: 0, totalReviews: 0 };
	const reviews: Review[] = data?.getPropertyReviews?.list || [];
	const total: number = data?.getPropertyReviews?.metaCounter?.[0]?.total || 0;

	const filtered = photoFilter ? reviews.filter(r => r.reviewImages?.length > 0) : reviews;

	return (
		<div className="rev-section">
			<Typography className="rev-section-title">
				{t('Customer Reviews')}
				{summary.totalReviews > 0 && (
					<span className="rev-total-badge">({summary.totalReviews})</span>
				)}
			</Typography>

			{summary.totalReviews > 0 ? (
				<div className="rev-summary-row">
					<div className="rev-score-block">
						<Typography className="rev-score-big">{summary.averageRating.toFixed(1)}</Typography>
						<Rating value={summary.averageRating} readOnly precision={0.1} size="medium" />
						<Typography variant="caption" color="text.secondary">
							{summary.totalReviews} {t('reviews')}
						</Typography>
					</div>
					<div className="rev-bars">
						{[5, 4, 3, 2, 1].map(n => <StarBar key={n} rating={n} total={summary.totalReviews} />)}
					</div>
				</div>
			) : (
				<div className="rev-empty">
					<StarIcon sx={{ fontSize: 40, color: '#ddd' }} />
					<Typography color="text.secondary">{t('No reviews yet. Be the first!')}</Typography>
				</div>
			)}

			{reviews.length > 0 && (
				<>
					<Divider sx={{ my: 2 }} />

					{/* Filters */}
					<div className="rev-filters">
						<div className="rev-sort-btns">
							<button className={`rev-sort-btn ${sortBy === 'createdAt' ? 'active' : ''}`} onClick={() => setSortBy('createdAt')}>{t('Latest')}</button>
							<button className={`rev-sort-btn ${sortBy === 'reviewRating' ? 'active' : ''}`} onClick={() => setSortBy('reviewRating')}>{t('Rating')}</button>
						</div>
						<button className={`rev-photo-btn ${photoFilter ? 'active' : ''}`} onClick={() => setPhotoFilter(p => !p)}>
							<PhotoOutlinedIcon sx={{ fontSize: 14 }} /> {t('With Photos')}
						</button>
					</div>

					{/* Review list */}
					<div className="rev-list">
						{loading && <div className="rev-loading">{t('Loading...')}</div>}
						{filtered.map(review => (
							<div className="rev-card" key={review._id}>
								<div className="rev-card-header">
									<div className="rev-user-info">
										<img
											src={review.memberData?.memberImage
												? `${REACT_APP_API_URL}/${review.memberData.memberImage}`
												: '/img/profile/defaultUser.svg'}
											alt={review.memberData?.memberNick}
											className="rev-user-avatar"
										/>
										<div>
											<Typography className="rev-user-nick">{review.memberData?.memberNick || 'User'}</Typography>
											<Typography className="rev-review-date" variant="caption">
												{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
											</Typography>
										</div>
									</div>
									<Rating value={review.reviewRating} readOnly size="small" />
								</div>

								<Typography className="rev-content">{review.reviewContent}</Typography>

								{review.reviewImages?.length > 0 && (
									<div className="rev-images">
										{review.reviewImages.map((img, i) => (
											<img
												key={i}
												src={`${REACT_APP_API_URL}/${img}`}
												alt={`review-img-${i}`}
												className="rev-img-thumb"
											/>
										))}
									</div>
								)}
							</div>
						))}
					</div>

					{/* Pagination */}
					{total > page * 5 && (
						<Box display="flex" justifyContent="center" mt={2}>
							<Button variant="outlined" size="small" onClick={() => setPage(p => p + 1)}>
								{t('Load More')}
							</Button>
						</Box>
					)}
				</>
			)}
		</div>
	);
};

export default ReviewSection;
