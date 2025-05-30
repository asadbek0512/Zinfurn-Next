import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Typography, Button, Pagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	
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
			console.log('ERROR, likeArticleHandler:', err.message);
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
					<Typography className="category-title">{title} BOARD</Typography>
					<Typography className="category-subtitle">
						Express your opinions freely here without content restrictions
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
								{isShowingAll ? 'Show Less' : 'See More'}
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
									Total {total} article{total > 1 ? 's' : ''} in {title.toLowerCase()}
								</Typography>
							</Stack>
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<div id="community-list-page">
				<div className="container">
					<Stack className="main-box">
						<Stack className="right-config">
							<Stack className="header-section">
								<Typography className="main-title">Community Board</Typography>
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
									Article Write
								</Button>
							</Stack>

							<Stack className="categories-container">
								{renderCategory('FREE', BoardArticleCategory.FREE)}
								{renderCategory('RECOMMEND', BoardArticleCategory.RECOMMEND)}
								{renderCategory('NEWS', BoardArticleCategory.NEWS)}
								{renderCategory('HUMOR', BoardArticleCategory.HUMOR)}
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