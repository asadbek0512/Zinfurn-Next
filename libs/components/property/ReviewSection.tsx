// @ts-nocheck
import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_PROPERTY_REVIEWS, GET_PROPERTY_REVIEW_SUMMARY } from '../../../apollo/user/query';
import { TOGGLE_REVIEW_REACTION } from '../../../apollo/user/mutation';
import { Review, ReviewSummary } from '../../types/review/review';
import { ReviewReaction } from '../../enums/review.enum';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ReviewSectionProps {
	propertyId: string;
}

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'];
const RATING_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'];

const FETCH_LIMIT = 100;
const INITIAL_VISIBLE = 10;
const VISIBLE_STEP = 10;
const GALLERY_PREVIEW_COUNT = 5;

const ReviewSection = ({ propertyId }: ReviewSectionProps) => {
	const { t } = useTranslation('common');
	const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
	const [photoFilter, setPhotoFilter] = useState(false);
	const [sortBy, setSortBy] = useState('createdAt');
	const [starFilter, setStarFilter] = useState<number | null>(null);
	const [lightbox, setLightbox] = useState<{ images: string[]; idx: number } | null>(null);
	const user = useReactiveVar(userVar);
	const [toggleReviewReaction] = useMutation(TOGGLE_REVIEW_REACTION);
	// local override of server reaction state, keyed by review _id
	const [reactions, setReactions] = useState<
		Record<string, { likesCount: number; dislikesCount: number; myReaction: ReviewReaction | null }>
	>({});

	const { data: summaryData } = useQuery(GET_PROPERTY_REVIEW_SUMMARY, {
		variables: { propertyId },
		skip: !propertyId,
		fetchPolicy: 'cache-and-network',
	});

	const { data, loading } = useQuery(GET_PROPERTY_REVIEWS, {
		variables: {
			input: {
				page: 1,
				limit: FETCH_LIMIT,
				sort: sortBy,
				direction: 'DESC',
				search: { propertyId },
			},
		},
		skip: !propertyId,
		fetchPolicy: 'cache-and-network',
	});

	// filtr yoki sort o'zgarsa, ko'rinishni 10 taga qaytaramiz
	React.useEffect(() => {
		setVisibleCount(INITIAL_VISIBLE);
	}, [sortBy, photoFilter, starFilter]);

	const summary: ReviewSummary = summaryData?.getPropertyReviewSummary || {
		averageRating: 0,
		totalReviews: 0,
		ratingDistribution: [],
	};
	const reviews: Review[] = data?.getPropertyReviews?.list || [];
	const total: number = data?.getPropertyReviews?.metaCounter?.[0]?.total || 0;

	// show content if either summary says there are reviews OR actual list has items
	const hasContent = summary.totalReviews > 0 || reviews.length > 0 || total > 0;
	const displayTotal = summary.totalReviews || total;

	const dist = summary.ratingDistribution || [];
	const getStarCount = (star: number) => dist.find((d) => d.star === star)?.count || 0;

	let filtered = [...reviews];
	if (photoFilter) filtered = filtered.filter((r) => r.reviewImages?.length > 0);
	if (starFilter !== null) filtered = filtered.filter((r) => r.reviewRating === starFilter);

	const visibleReviews = filtered.slice(0, visibleCount);
	const hasMore = filtered.length > visibleCount;
	const isExpanded = visibleCount > INITIAL_VISIBLE;

	const allPhotos = reviews.flatMap((r) => (r.reviewImages || []).map((img) => img));

	const openLightbox = (images: string[], idx: number) => setLightbox({ images, idx });

	// merge server review data with any local override
	const getReaction = (review: Review) => {
		const o = reactions[review._id];
		return {
			likesCount: o?.likesCount ?? review.likesCount ?? 0,
			dislikesCount: o?.dislikesCount ?? review.dislikesCount ?? 0,
			myReaction: o ? o.myReaction : review.myReaction ?? null,
		};
	};

	const handleReaction = async (reviewId: string, reaction: ReviewReaction) => {
		if (!user?._id) {
			await sweetMixinErrorAlert(t('Please login first'));
			return;
		}
		try {
			const { data } = await toggleReviewReaction({ variables: { reviewId, reaction } });
			const res = data?.toggleReviewReaction;
			if (res) {
				setReactions((prev) => ({
					...prev,
					[reviewId]: {
						likesCount: res.likesCount,
						dislikesCount: res.dislikesCount,
						myReaction: res.myReaction ?? null,
					},
				}));
			}
		} catch (err) {
			await sweetMixinErrorAlert((err as Error).message);
		}
	};

	const avgRounded = Math.round(summary.averageRating);

	return (
		<div className="rev-section">
			{/* Header */}
			<div className="rev-header">
				<Typography className="rev-title">
					{t('Customer Reviews')}
					{displayTotal > 0 && <span className="rev-total-badge">{displayTotal}</span>}
				</Typography>
			</div>

			{hasContent ? (
				<>
					{/* Summary */}
					<div className="rev-summary">
						<div className="rev-score-panel">
							<div className="rev-score-num">{summary.averageRating.toFixed(1)}</div>
							<div className="rev-score-stars">
								{[1, 2, 3, 4, 5].map((i) => (
									<StarIcon
										key={i}
										sx={{
											fontSize: 20,
											color: i <= Math.round(summary.averageRating) ? '#f5a623' : 'var(--bg-strong)',
										}}
									/>
								))}
							</div>
							<div className="rev-score-label" style={{ color: RATING_COLORS[avgRounded] || '#f5a623' }}>
								{t(RATING_LABELS[avgRounded] || 'Good')}
							</div>
							<div className="rev-score-count">
								{displayTotal} {t('reviews')}
							</div>
						</div>

						<div className="rev-dist-panel">
							{[5, 4, 3, 2, 1].map((star) => {
								const count = getStarCount(star);
								const pct = displayTotal > 0 ? (count / displayTotal) * 100 : 0;
								const isActive = starFilter === star;
								return (
									<div
										key={star}
										className={`rev-dist-row ${isActive ? 'active' : ''}`}
										onClick={() => setStarFilter(isActive ? null : star)}
									>
										<span className="rev-dist-star">{star}</span>
										<StarIcon sx={{ fontSize: 11, color: 'var(--star)', flexShrink: 0 }} />
										<div className="rev-dist-bar">
											<div className="rev-dist-fill" style={{ width: `${pct}%` }} />
										</div>
										<span className="rev-dist-count">{count}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Photo gallery strip */}
					{allPhotos.length > 0 && (
						<div className="rev-photo-gallery">
							<Typography className="rev-gallery-title">
								<PhotoOutlinedIcon sx={{ fontSize: 15 }} />
								{t('Photos from Reviews')} ({allPhotos.length})
							</Typography>
							<div className="rev-gallery-strip">
								{allPhotos.slice(0, GALLERY_PREVIEW_COUNT).map((img, i) => {
									const remaining = allPhotos.length - GALLERY_PREVIEW_COUNT;
									const showMore = i === GALLERY_PREVIEW_COUNT - 1 && remaining > 0;
									return (
										<div
											key={i}
											className="rev-gallery-cell"
											onClick={() => openLightbox(allPhotos, i)}
										>
											<img loading="lazy" decoding="async" src={`${REACT_APP_API_URL}/${img}`} alt="" className="rev-gallery-thumb" />
											{showMore && (
												<div className="rev-gallery-more">
													<span className="rev-gallery-more-count">+{remaining}</span>
													<span className="rev-gallery-more-label">{t('See more')}</span>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Toolbar */}
					<div className="rev-toolbar">
						<div className="rev-sort-group">
							<button
								className={`rev-sort-btn ${sortBy === 'createdAt' ? 'active' : ''}`}
								onClick={() => setSortBy('createdAt')}
							>
								{t('Latest')}
							</button>
							<button
								className={`rev-sort-btn ${sortBy === 'reviewRating' ? 'active' : ''}`}
								onClick={() => setSortBy('reviewRating')}
							>
								{t('Highest')}
							</button>
						</div>

						<div className="rev-filter-group">
							{starFilter !== null && (
								<button className="rev-filter-chip active" onClick={() => setStarFilter(null)}>
									{starFilter}★ <CloseIcon sx={{ fontSize: 11 }} />
								</button>
							)}
							<button
								className={`rev-filter-chip ${photoFilter ? 'active' : ''}`}
								onClick={() => setPhotoFilter((p) => !p)}
							>
								<PhotoOutlinedIcon sx={{ fontSize: 13 }} /> {t('With Photos')}
							</button>
						</div>
					</div>

					{/* Review list */}
					<div className="rev-list">
						{loading && <div className="rev-loading">{t('Loading...')}</div>}
						{filtered.length === 0 && !loading && (
							<div className="rev-no-results">
								<StarBorderIcon sx={{ fontSize: 40, color: 'var(--bg-strong)' }} />
								<Typography color="text.secondary">{t('No reviews matching this filter')}</Typography>
							</div>
						)}
						{visibleReviews.map((review) => (
							<div className="rev-card" key={review._id}>
								<div className="rev-card-top">
									<div className="rev-user-block">
										<img
											src={
												review.memberData?.memberImage
													? `${REACT_APP_API_URL}/${review.memberData.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
											alt={review.memberData?.memberNick}
											className="rev-avatar"
										/>
										<div className="rev-user-details">
											<span className="rev-user-name">{review.memberData?.memberNick || 'User'}</span>
											<div className="rev-verified">
												<VerifiedIcon sx={{ fontSize: 11, color: 'var(--success)' }} />
												<span>{t('Verified Purchase')}</span>
											</div>
										</div>
									</div>

									<div className="rev-meta">
										<div className="rev-stars-row">
											{[1, 2, 3, 4, 5].map((i) => (
												<StarIcon
													key={i}
													sx={{
														fontSize: 14,
														color: i <= review.reviewRating ? '#f5a623' : 'var(--bg-strong)',
													}}
												/>
											))}
											<span
												className="rev-rating-label"
												style={{ color: RATING_COLORS[review.reviewRating] || 'var(--text-3)' }}
											>
												{t(RATING_LABELS[review.reviewRating] || '')}
											</span>
										</div>
										<span className="rev-date">
											{new Date(review.createdAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
											})}
										</span>
									</div>
								</div>

								<p className="rev-text">{review.reviewContent}</p>

								{review.reviewImages?.length > 0 && (
									<div className="rev-imgs">
										{review.reviewImages.map((img, i) => (
											<img
												key={i}
												src={`${REACT_APP_API_URL}/${img}`}
												alt=""
												className="rev-img-thumb"
												onClick={() => openLightbox(review.reviewImages, i)}
											/>
										))}
									</div>
								)}

								<div className="rev-card-footer">
									{(() => {
										const r = getReaction(review);
										return (
											<>
												<button
													className={`rev-react-btn like ${r.myReaction === ReviewReaction.LIKE ? 'active' : ''}`}
													onClick={() => handleReaction(review._id, ReviewReaction.LIKE)}
												>
													{r.myReaction === ReviewReaction.LIKE ? (
														<ThumbUpIcon sx={{ fontSize: 14 }} />
													) : (
														<ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
													)}
													<span>{t('Helpful')}</span>
													{r.likesCount > 0 && <span className="rev-react-count">{r.likesCount}</span>}
												</button>
												<button
													className={`rev-react-btn dislike ${r.myReaction === ReviewReaction.DISLIKE ? 'active' : ''}`}
													onClick={() => handleReaction(review._id, ReviewReaction.DISLIKE)}
												>
													{r.myReaction === ReviewReaction.DISLIKE ? (
														<ThumbDownIcon sx={{ fontSize: 14 }} />
													) : (
														<ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
													)}
													{r.dislikesCount > 0 && <span className="rev-react-count">{r.dislikesCount}</span>}
												</button>
											</>
										);
									})()}
								</div>
							</div>
						))}
					</div>

					{/* Show more / Hide */}
					{(hasMore || isExpanded) && (
						<div className="rev-load-more-wrap">
							{hasMore && (
								<button
									className="rev-load-more-btn"
									onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}
								>
									<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
									{t('Show more')} ({filtered.length - visibleCount} {t('remaining')})
								</button>
							)}
							{isExpanded && (
								<button
									className="rev-load-more-btn rev-hide-btn"
									onClick={() => setVisibleCount(INITIAL_VISIBLE)}
								>
									<KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
									{t('Hide')}
								</button>
							)}
						</div>
					)}
				</>
			) : (
				<div className="rev-empty">
					<div className="rev-empty-stars">
						{[1, 2, 3, 4, 5].map((i) => (
							<StarBorderIcon key={i} sx={{ fontSize: 32, color: 'var(--bg-strong)' }} />
						))}
					</div>
					<Typography className="rev-empty-title">{t('No reviews yet')}</Typography>
					<Typography className="rev-empty-sub">{t('Be the first to share your experience!')}</Typography>
				</div>
			)}

			{/* Lightbox */}
			{lightbox && (
				<div className="rev-lightbox" onClick={() => setLightbox(null)}>
					<div className="rev-lb-inner" onClick={(e) => e.stopPropagation()}>
						<button className="rev-lb-close" onClick={() => setLightbox(null)}>
							<CloseIcon />
						</button>
						<img
							className="rev-lb-img"
							src={`${REACT_APP_API_URL}/${lightbox.images[lightbox.idx]}`}
							alt=""
						/>
						{lightbox.images.length > 1 && (
							<>
								<button
									className="rev-lb-nav prev"
									disabled={lightbox.idx === 0}
									onClick={() => setLightbox((prev) => prev ? { ...prev, idx: prev.idx - 1 } : null)}
								>
									<NavigateBeforeIcon />
								</button>
								<button
									className="rev-lb-nav next"
									disabled={lightbox.idx === lightbox.images.length - 1}
									onClick={() => setLightbox((prev) => prev ? { ...prev, idx: prev.idx + 1 } : null)}
								>
									<NavigateNextIcon />
								</button>
								<div className="rev-lb-counter">
									{lightbox.idx + 1} / {lightbox.images.length}
								</div>
								<div className="rev-lb-thumbnails">
									{lightbox.images.map((img, i) => (
										<img
											key={i}
											src={`${REACT_APP_API_URL}/${img}`}
											className={`rev-lb-thumb ${i === lightbox.idx ? 'active' : ''}`}
											onClick={() => setLightbox((prev) => prev ? { ...prev, idx: i } : null)}
										/>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default ReviewSection;
