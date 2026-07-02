import React, { useState } from 'react';
import { Stack, Box, Typography, Link } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import MobilePropertyCard from './MobilePropertyCard';
import TrendPropertyCard from './TrendPropertyCard';
import PropertyCardSkeleton from '../common/PropertyCardSkeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface ProductsCollectionProps {
	latestInput: PropertiesInquiry;
	bestSellersInput: PropertiesInquiry;
	featuredInput: PropertiesInquiry;
}

const ProductsCollection = (props: ProductsCollectionProps) => {
	const { latestInput, bestSellersInput, featuredInput } = props;
	const router = useRouter();
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState('top');
	const [properties, setProperties] = useState<Property[]>([]);

	const { t } = useTranslation('common');

	const getCurrentInput = () => {
		switch (activeTab) {
			case 'all':
				return { ...latestInput, limit: 6 };
			case 'top':
				return { ...latestInput, limit: 6 };
			case 'popular':
				return bestSellersInput;
			case 'trend':
				return featuredInput;
			default:
				return latestInput;
		}
	};

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: getCurrentInput() },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getProperties?.list || []);
		},
	});

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: getCurrentInput() });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		const inputMap = {
			all: { ...latestInput, limit: 6 },
			top: latestInput,
			popular: bestSellersInput,
			trend: featuredInput,
		};

		getPropertiesRefetch({
			input: inputMap[tab as keyof typeof inputMap] || latestInput,
		});
	};

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: '#fff' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 8px' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', marginBottom: '6px' }}>
						<div style={{ width: '30px', height: '2px', background: '#cf6422' }} />
						<span style={{ fontSize: '13px', fontWeight: 500, color: '#000' }}>{t('Our Properties')}</span>
					</div>
					<div style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>{t('Properties Collections')}</div>
				</div>

				{/* Tabs */}
				<div style={{ display: 'flex', gap: '8px', padding: '10px 16px', overflowX: 'auto' }}>
					{[{ key: 'top', label: t('Top Properties') }, { key: 'popular', label: t('Popular') }, { key: 'trend', label: t('Trend') }].map((tab) => (
						<button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
							padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
							border: activeTab === tab.key ? 'none' : '1px solid #ddd',
							background: activeTab === tab.key ? '#cf6422' : '#fff',
							color: activeTab === tab.key ? '#fff' : '#666',
							cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
						}}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Kartalar */}
				{getPropertiesLoading && !properties.length ? (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{Array.from({ length: 4 }).map((_, i) => (
							<PropertyCardSkeleton key={i} />
						))}
					</div>
				) : properties.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('No Products Found')}</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{properties.slice(0, 4).map((property: Property) => (
							<MobilePropertyCard key={property._id} property={property} likePropertyHandler={likePropertyHandler} />
						))}
					</div>
				)}

				<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
					<span onClick={() => router.push('/property')} style={{ fontSize: '12px', color: '#cf6422', fontWeight: 500, cursor: 'pointer' }}>
						{t('All Furnitures')} →
					</span>
				</div>

			</div>
		);
	}

	return (
		<Stack className="products-collection">
			<Stack className="container">
				<Stack className="info-box">
					<Typography className="section-subtitle">{t('Our Properties')}</Typography>
					<Typography className="section-title">{t('Properties Collections')}</Typography>
				</Stack>

				<Box component="div" className="tabs-container">
					<Box
						component="div"
						className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
						onClick={() => handleTabChange('top')}
					>
						{t('Top Properties')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'popular' ? 'active' : ''}`}
						onClick={() => handleTabChange('popular')}
					>
						{t('Popular Properties')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'trend' ? 'active' : ''}`}
						onClick={() => handleTabChange('trend')}
					>
						{t('Trend Properties')}
					</Box>
				</Box>

				<Stack className="card-box">
					{getPropertiesLoading && !properties.length ? (
						<Box component="div" className="products-grid">
							{Array.from({ length: 6 }).map((_, i) => (
								<PropertyCardSkeleton key={i} />
							))}
						</Box>
					) : properties.length === 0 ? (
						<Box component="div" className="empty-list">
							{t('No Products Found')}
						</Box>
					) : (
						<Box component="div" className="products-grid">
							{properties.slice(0, 6).map((property: Property) => (
								<TrendPropertyCard key={property._id} property={property} likePropertyHandler={likePropertyHandler} />
							))}
						</Box>
					)}
				</Stack>

				<Link href="/property" className="view-button">
					{t('All Properties')}
				</Link>
			</Stack>
		</Stack>
	);
};

ProductsCollection.defaultProps = {
	latestInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
	bestSellersInput: {
		page: 1,
		limit: 12,
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
	featuredInput: {
		page: 1,
		limit: 12,
		sort: 'propertyRank',
		direction: 'DESC',
		search: {},
	},
};

export default ProductsCollection;
