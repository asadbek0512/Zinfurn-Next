import React, { useState } from 'react';
import { Stack, Box, Typography, Link } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import MobileProductCard from './MobileProductCard';
import TrendProductCard from './TrendProductCard';
import ProductCardSkeleton from '../common/ProductCardSkeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T, getErrorMessage } from '../../types/common';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message, Direction } from '../../enums/common.enum';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface ProductsCollectionProps {
	latestInput: ProductsInquiry;
	bestSellersInput: ProductsInquiry;
	featuredInput: ProductsInquiry;
}

const ProductsCollection = (props: ProductsCollectionProps) => {
	const { latestInput, bestSellersInput, featuredInput } = props;
	const router = useRouter();
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState('top');
	const [products, setProducts] = useState<Product[]>([]);

	const { t } = useTranslation('common');

	const getCurrentInput = () => {
		switch (activeTab) {
			case 'all':
				return { ...latestInput, limit: TAB_LIMIT };
			case 'top':
				return { ...latestInput, limit: TAB_LIMIT };
			case 'popular':
				return bestSellersInput;
			case 'trend':
				return featuredInput;
			default:
				return latestInput;
		}
	};

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: getCurrentInput() },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list || []);
		},
	});

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			const result = await likeTargetProduct({ variables: { input: id } });

			// Refetch o'rniga faqat bosilgan kartani lokal yangilaymiz — ro'yxat "lip-lip" qilmasin
			const updatedLikes = result?.data?.likeTargetProduct?.productLikes;
			setProducts((prev) =>
				prev.map((p) =>
					p._id === id
						? {
								...p,
								productLikes: updatedLikes ?? p.productLikes,
								meLiked: p.meLiked?.[0]?.myFavorite
									? []
									: [{ memberId: user._id, likeRefId: id, myFavorite: true }],
						  }
						: p,
				),
			);
		} catch (err: unknown) {
			console.error('ERROR, likeProductHandler', getErrorMessage(err));
			sweetMixinErrorAlert(getErrorMessage(err)).then();
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

		getProductsRefetch({
			input: inputMap[tab as keyof typeof inputMap] || latestInput,
		});
	};

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: 'var(--surface)' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 8px' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', marginBottom: '6px' }}>
						<div style={{ width: '30px', height: '2px', background: 'var(--primary)' }} />
						<span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>{t('Our Furniture')}</span>
					</div>
					<div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>{t('Products Collections')}</div>
				</div>

				{/* Tabs */}
				<div style={{ display: 'flex', gap: '8px', padding: '10px 16px', overflowX: 'auto' }}>
					{[{ key: 'top', label: t('Top Furniture') }, { key: 'popular', label: t('Popular') }, { key: 'trend', label: t('Trend') }].map((tab) => (
						<button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
							padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
							border: activeTab === tab.key ? 'none' : '1px solid var(--border)',
							background: activeTab === tab.key ? 'var(--primary)' : 'var(--surface)',
							color: activeTab === tab.key ? '#fff' : 'var(--text-2)',
							cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
						}}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Kartalar */}
				{getProductsLoading && !products.length ? (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{Array.from({ length: 4 }).map((_, i) => (
							<ProductCardSkeleton key={i} />
						))}
					</div>
				) : products.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-4)' }}>{t('No Products Found')}</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{products.slice(0, 4).map((product: Product) => (
							<MobileProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
						))}
					</div>
				)}

				<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
					<span onClick={() => router.push('/products')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer' }}>
						{t('All Furniture')} →
					</span>
				</div>

			</div>
		);
	}

	return (
		<Stack className="products-collection">
			<Stack className="container">
				<Stack className="info-box">
					<Typography className="section-subtitle">{t('Our Furniture')}</Typography>
					<Typography className="section-title">{t('Products Collections')}</Typography>
				</Stack>

				<Box component="div" className="tabs-container">
					<Box
						component="div"
						className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
						onClick={() => handleTabChange('top')}
					>
						{t('Top Furniture')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'popular' ? 'active' : ''}`}
						onClick={() => handleTabChange('popular')}
					>
						{t('Popular Products')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'trend' ? 'active' : ''}`}
						onClick={() => handleTabChange('trend')}
					>
						{t('Trend Products')}
					</Box>
				</Box>

				<Stack className="card-box">
					{getProductsLoading && !products.length ? (
						<Box component="div" className="products-grid">
							{Array.from({ length: 6 }).map((_, i) => (
								<ProductCardSkeleton key={i} />
							))}
						</Box>
					) : products.length === 0 ? (
						<Box component="div" className="empty-list">
							{t('No Products Found')}
						</Box>
					) : (
						<Box component="div" className="products-grid">
							{products.slice(0, 6).map((product: Product) => (
								<TrendProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
							))}
						</Box>
					)}
				</Stack>

				<Link href="/products" className="view-button">
					{t('All Furniture')}
				</Link>
			</Stack>
		</Stack>
	);
};

const LATEST_INPUT: ProductsInquiry = {
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};
const TAB_LIMIT = 6;

// Boshlang'ich 'top' tab'i so'rovi — Home getStaticProps shuni oldindan yuklaydi
export const TOP_PRODUCTS_INITIAL_INPUT: ProductsInquiry = { ...LATEST_INPUT, limit: TAB_LIMIT };

ProductsCollection.defaultProps = {
	latestInput: LATEST_INPUT,
	bestSellersInput: {
		page: 1,
		limit: 12,
		sort: 'productLikes',
		direction: 'DESC',
		search: {},
	},
	featuredInput: {
		page: 1,
		limit: 12,
		sort: 'productRank',
		direction: 'DESC',
		search: {},
	},
};

export default ProductsCollection;
