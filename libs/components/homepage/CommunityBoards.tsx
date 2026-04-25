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
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';

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
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const {
		loading: getNewsArticlesLoading,
		data: getNewsArticlesData,
		error: getNewsArticlesError,
		refetch: getNewsArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...searchCommunity,
				limit: 6,
				search: { articleCategory: BoardArticleCategory.NEWS },
			},
		},
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
		variables: {
			input: {
				...searchCommunity,
				limit: 3,
				search: { articleCategory: BoardArticleCategory.FREE },
			},
		},
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
		return (
			<div style={{ padding: '16px 0', background: '#f8f7f4' }}>
				{/* Header */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 16px 12px' }}>
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
							<div style={{ width: '30px', height: '2px', background: '#cf6422' }} />
							<span style={{ fontSize: '12px', fontWeight: 500, color: '#000' }}>{t('News & Blogs')}</span>
						</div>
						<div style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>{t('Our Latest News')}</div>
					</div>
					<Link href="/community" style={{ fontSize: '12px', color: '#cf6422', fontWeight: 500, textDecoration: 'none' }}>
						{t('View All')} →
					</Link>
				</div>

				{/* Tabs */}
				<div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px' }}>
					{[{ key: 'news' as const, label: t('News') }, { key: 'free' as const, label: t('Free') }].map((tab) => (
						<button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
							padding: '6px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
							border: activeTab === tab.key ? 'none' : '1px solid #ddd',
							background: activeTab === tab.key ? '#cf6422' : '#fff',
							color: activeTab === tab.key ? '#fff' : '#666',
							cursor: 'pointer'
						}}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Cards — News: Swiper, Free: vertikal list */}
				{activeTab === 'news' ? (
					newsArticles.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('No Articles')}</div>
					) : (
						<Swiper slidesPerView={1.8} spaceBetween={10} touchStartPreventDefault={false} style={{ paddingLeft: '16px', paddingRight: '8px' }}>
							{newsArticles.slice(0, 6).map((article, index) => (
								<SwiperSlide key={article?._id}>
									<CommunityCard vertical={true} article={article} index={index} />
								</SwiperSlide>
							))}
						</Swiper>
					)
				) : (
					freeArticles.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('No Articles')}</div>
					) : (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
							{freeArticles.slice(0, 3).map((article, index) => (
								<CommunityCard vertical={false} article={article} index={index} key={article?._id} />
							))}
						</div>
					)
				)}
			</div>
		);
	} else {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<div className="community-header">
						<div className="left-text">
							<Typography variant={'h1'}>{t('News & Blogs')}</Typography>
							<h2 className="main-title">{t('Our Latest')}</h2>
							<h2 className="green-title">{t('News & Blogs')}</h2>
						</div>

						<Link href="/community" className="view-button">
							{t('View All Blogs')}
						</Link>
					</div>

					<Stack className={'tabs-section'}>
						<div className={'tab-buttons'}>
							<button
								className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
								onClick={() => handleTabChange('news')}
							>
								{t('News')}
							</button>
							<button
								className={`tab-btn ${activeTab === 'free' ? 'active' : ''}`}
								onClick={() => handleTabChange('free')}
							>
								{t('Free')}
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
