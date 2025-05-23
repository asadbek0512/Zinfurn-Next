import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { BoardArticleCategory } from '../../enums/board-article.enum';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState<'news' | 'free'>('news');
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getNewsArticlesLoading,
		data: getNewsArticlesData,
		error: getNewsArticlesError,
		refetch: getNewsArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.NEWS } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewsArticles(data?.getBoardArticles?.list);
		},
	});

	const {
		loading: getFreeArticlesLoading,
		data: getFreeArticlesData,
		error: getFreeArticlesError,
		refetch: getFreeArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 3, search: { articleCategory: BoardArticleCategory.FREE } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list);
		},
	});

	/** HANDLERS **/
	const handleTabChange = (tab: 'news' | 'free') => {
		setActiveTab(tab);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<div className="community-header">
						<div className="left-text">
						<Typography variant={'h1'}>News & Blogs</Typography>
							<h2 className="main-title">Our Latest</h2>
							<h2 className="green-title">News & Blogs</h2>
						</div>

						<Link href="/community" className="view-button">
							View All Blogs
						</Link>
					</div>

					<Stack className={'tabs-section'}>
						<div className={'tab-buttons'}>
							<button
								className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
								onClick={() => handleTabChange('news')}
							>
								News
							</button>
							<button
								className={`tab-btn ${activeTab === 'free' ? 'active' : ''}`}
								onClick={() => handleTabChange('free')}
							>
								Free
							</button>
						</div>

						<div className={'tab-content'}>
							{activeTab === 'news' && (
								<Stack className={'cards-grid news-grid'}>
									{newsArticles.map((article, index) => (
										<CommunityCard vertical={true} article={article} index={index} key={article?._id} />
									))}
								</Stack>
							)}

							{activeTab === 'free' && (
								<Stack className={'cards-grid free-grid'}>
									{freeArticles.map((article, index) => (
										<CommunityCard vertical={false} article={article} index={index} key={article?._id} />
									))}
								</Stack>
							)}
						</div>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
