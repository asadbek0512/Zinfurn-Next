import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography, Button, Pagination, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CommunityCard from '../../libs/components/common/CommunityCard';
import PropertyCardSkeleton from '../../libs/components/common/PropertyCardSkeleton';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery } from '@apollo/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next'; // Translation import

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common'); // Translation hook
	
	// Barcha kategoriyalar uchun yagona state
	const [allArticles, setAllArticles] = useState<{
		FREE: BoardArticle[];
		RECOMMEND: BoardArticle[];
		NEWS: BoardArticle[];
		HUMOR: BoardArticle[];
	}>({
		FREE: [],
		RECOMMEND: [],
		NEWS: [],
		HUMOR: []
	});

	const [showAll, setShowAll] = useState<{
		FREE: boolean;
		RECOMMEND: boolean;
		NEWS: boolean;
		HUMOR: boolean;
	}>({
		FREE: false,
		RECOMMEND: false,
		NEWS: false,
		HUMOR: false
	});

	const [currentPages, setCurrentPages] = useState<{
		FREE: number;
		RECOMMEND: number;
		NEWS: number;
		HUMOR: number;
	}>({
		FREE: 1,
		RECOMMEND: 1,
		NEWS: 1,
		HUMOR: 1
	});

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...initialInput,
				limit: 100 // Barcha maqolalarni olish
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const articles = data?.getBoardArticles?.list || [];
			
			// Kategoriyalar bo'yicha ajratish
			setAllArticles({
				FREE: articles.filter((article: BoardArticle) => article.articleCategory === 'FREE'),
				RECOMMEND: articles.filter((article: BoardArticle) => article.articleCategory === 'RECOMMEND'),
				NEWS: articles.filter((article: BoardArticle) => article.articleCategory === 'NEWS'),
				HUMOR: articles.filter((article: BoardArticle) => article.articleCategory === 'HUMOR')
			});
		},
	});

	// Skeleton kamida ~0.7s ko'rinsin (flash bo'lmasin)
	const [showSkeleton, setShowSkeleton] = useState(true);
	useEffect(() => {
		if (boardArticlesLoading) {
			setShowSkeleton(true);
			return;
		}
		const timer = setTimeout(() => setShowSkeleton(false), 700);
		return () => clearTimeout(timer);
	}, [boardArticlesLoading]);

	/** HANDLERS **/
	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticlesRefetch();
		} catch (err: any) {
			console.error('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// See More/Show Less
	const toggleShowAll = (category: BoardArticleCategory) => {
		setShowAll(prev => ({
			...prev,
			[category]: !prev[category]
		}));
		
		if (showAll[category]) {
			setCurrentPages(prev => ({
				...prev,
				[category]: 1
			}));
		}
	};

	// Pagination
	const paginationHandler = (category: BoardArticleCategory, page: number) => {
		setCurrentPages(prev => ({
			...prev,
			[category]: page
		}));
	};

	// Ko'rsatiladigan maqolalar
	const getDisplayedArticles = (category: BoardArticleCategory) => {
		const articles = allArticles[category];
		const isShowingAll = showAll[category];
		const page = currentPages[category];

		if (!isShowingAll) {
			return articles.slice(0, 3);
		} else {
			const start = (page - 1) * 6;
			return articles.slice(start, start + 6);
		}
	};

	// Kategoriya render
	const renderCategory = (title: string, category: BoardArticleCategory) => {
		const articles = allArticles[category];
		const displayedArticles = getDisplayedArticles(category);
		const total = articles.length;
		const isShowingAll = showAll[category];
		const page = currentPages[category];
		const totalPages = Math.ceil(total / 6);

		if (total === 0) return null;

		return (
			<Stack className="category-section" key={category}>
				<Stack className="category-header">
					<Typography className="category-title">{t(title)} {t('BOARD')}</Typography>
					<Typography className="category-subtitle">
						{t('Express your opinions freely here without content restrictions')}
					</Typography>
				</Stack>

				<Stack className="category-content">
					<Stack className="articles-grid">
						{displayedArticles.map((boardArticle: BoardArticle) => (
							<CommunityCard
								boardArticle={boardArticle}
								key={boardArticle?._id}
								likeArticleHandler={likeArticleHandler}
							/>
						))}
					</Stack>
					
					{total > 3 && (
						<Stack className="see-more-container">
							<Button
								className="see-more-btn"
								onClick={() => toggleShowAll(category)}
							>
								{isShowingAll ? t('Show Less') : t('See More')}
							</Button>
						</Stack>
					)}

					{isShowingAll && total > 6 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									page={page}
									count={totalPages}
									onChange={(event, value) => paginationHandler(category, value)}
									shape="circular"
									color="primary"
								/>
							</Stack>
							<Stack className="total-info">
								<Typography>
									{t('Total')} {total} {t('article')}{total > 1 ? t('s') : ''} {t('in')} {t(title.toLowerCase())}
								</Typography>
							</Stack>
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	};

	const renderCategoryMobile = (title: string, category: BoardArticleCategory) => {
		const articles = allArticles[category];
		const total = articles.length;
		const isShowingAll = showAll[category];
		const page = currentPages[category];
		const totalPages = Math.ceil(total / 6);

		if (total === 0) return null;

		return (
			<div key={category} style={{ marginBottom: '24px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', paddingLeft: '16px' }}>
					<div style={{ width: '25px', height: '2px', background: 'var(--primary)' }} />
					<span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-1)' }}>{t(title)} {t('BOARD')}</span>
				</div>
				<div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px', paddingLeft: '16px' }}>
					{t('Express your opinions freely here')}
				</div>

				<div className="mob-articles-grid">
					<Swiper
						slidesPerView={2}
						spaceBetween={10}
						touchStartPreventDefault={false}
						style={{ paddingLeft: '16px', paddingRight: '8px', overflow: 'visible' }}
					>
						{articles.map((boardArticle: BoardArticle) => (
							<SwiperSlide key={boardArticle?._id}>
								<CommunityCard
									boardArticle={boardArticle}
									key={boardArticle?._id}
									likeArticleHandler={likeArticleHandler}
								/>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
				
				{isShowingAll && total > 6 && (
					<div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
						<Pagination
							page={page}
							count={totalPages}
							onChange={(event, value) => paginationHandler(category, value)}
							shape="circular"
							color="primary"
							size="small"
						/>
					</div>
				)}
			</div>
		);
	};

	if (device === 'mobile') {
		return (
			<div style={{ padding: '20px 0 80px', background: 'var(--bg-warm)', minHeight: '100vh' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 16px' }}>
					<div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-1)' }}>{t('Community Board')}</div>
					<Button
						onClick={() =>
							router.push({
								pathname: '/mypage',
								query: { category: 'writeArticle' },
							})
						}
						style={{ background: 'var(--primary)', color: '#fff', textTransform: 'none', borderRadius: '8px', fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
						startIcon={<EditIcon sx={{ fontSize: 16 }} />}
					>
						{t('Write')}
					</Button>
				</div>

				{showSkeleton ? (
					<div className="mob-articles-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{Array.from({ length: 4 }).map((_, i) => (
							<PropertyCardSkeleton key={i} />
						))}
					</div>
				) : (
					<>
						{renderCategoryMobile('FREE', BoardArticleCategory.FREE)}
						{renderCategoryMobile('RECOMMEND', BoardArticleCategory.RECOMMEND)}
						{renderCategoryMobile('NEWS', BoardArticleCategory.NEWS)}
						{renderCategoryMobile('HUMOR', BoardArticleCategory.HUMOR)}
					</>
				)}
			</div>
		);
	} else {
		return (
			<div id="community-list-page">
				<div className="container">
					<Stack className="main-box">
						<Stack className="right-config">
							<Stack className="header-section">
								<Typography className="main-title">{t('Community Board')}</Typography>
								<Button
									onClick={() =>
										router.push({
											pathname: '/mypage',
											query: {
												category: 'writeArticle',
											},
										})
									}
									className="write-btn"
									startIcon={<EditIcon />}
								>
									{t('Article Write')}
								</Button>
							</Stack>

							<Stack className="categories-container">
								{showSkeleton ? (
									<div className="zf-community-skel">
										{Array.from({ length: 6 }).map((_, i) => (
											<PropertyCardSkeleton key={i} />
										))}
									</div>
								) : (
									<>
										{renderCategory('FREE', BoardArticleCategory.FREE)}
										{renderCategory('RECOMMEND', BoardArticleCategory.RECOMMEND)}
										{renderCategory('NEWS', BoardArticleCategory.NEWS)}
										{renderCategory('HUMOR', BoardArticleCategory.HUMOR)}
									</>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'ASC',
		search: {},
	},
};

export default withLayoutBasic(Community);