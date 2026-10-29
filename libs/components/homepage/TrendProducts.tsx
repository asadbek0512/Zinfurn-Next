import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import MobileProductCard from './MobileProductCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import TrendProductCard from './TrendProductCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T, getErrorMessage } from '../../types/common';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Direction, Message } from '../../enums/common.enum';
import { useTranslation } from 'next-i18next';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useCurrency } from '../../context/CurrencyContext';

interface TrendProductsProps {
	initialInput: ProductsInquiry;
}

const TrendProducts = (props: TrendProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { formatPrice } = useCurrency();


	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});
	// Like bosilgach lokal yangilangan ro'yxat; bo'lmasa query (SSR cache) natijasi
	const [likedList, setLikedList] = useState<Product[] | null>(null);
	const trendProducts: Product[] = likedList ?? getProductsData?.getProducts?.list ?? [];

	/** HANDLERS **/
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			const result = await likeTargetProduct({ variables: { input: id } });

			// Refetch o'rniga faqat bosilgan kartani lokal yangilaymiz — ro'yxat "lip-lip" qilmasin
			const updatedLikes = result?.data?.likeTargetProduct?.productLikes;
			setLikedList(
				trendProducts.map((p) =>
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

	if (!trendProducts) return null;

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: 'var(--bg-warm)', overflow: 'hidden', width: '100%' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 12px' }}>
					<div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-1)' }}>
						{t('Trend Products')} 🪑
					</div>
					<div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>
						{t('Easily explore our carefully curated categories to find your favorite items')}
					</div>
				</div>

				{/* Swiper */}
				{trendProducts.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-4)' }}>{t('Trends Empty')}</div>
				) : (
					<Swiper
						slidesPerView={2}
						spaceBetween={12}
						modules={[Autoplay]}
						touchStartPreventDefault={false}
						style={{ paddingLeft: '16px', paddingRight: '16px' }}
					>
						{trendProducts.map((product: Product) => (
							<SwiperSlide key={product._id}>
								<MobileProductCard product={product} likeProductHandler={likeProductHandler} />
							</SwiperSlide>
						))}
					</Swiper>
				)}
			</div>
		);
	} else {
		return (
			<Stack className={'trend-products'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>
								{t('Trend Products')} <img className={"icons"} src="img/icons/stol.png" alt="" loading="lazy" decoding="async" />
							</span>
							<p>{t('Easily explore our carefully curated categories to find your favorite items')}</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className="pagination-box">
								<button className="nav-button prev swiper-trend-prev">
									<WestIcon />
								</button>
								<button className="nav-button next swiper-trend-next">
									<EastIcon />
								</button>
							</div>
						</Box>
					</Stack>

					<Stack className={'card-box'}>
						{trendProducts.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('Trends Empty')}
							</Box>
						) : (
							<Swiper
								className={'trend-product-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
							>
								{trendProducts.map((product: Product) => (
									<SwiperSlide key={product._id} className={'trend-product-slide'}>
										<TrendProductCard product={product} likeProductHandler={likeProductHandler} />
									</SwiperSlide>
								))}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

// Home getStaticProps shu input bilan oldindan yuklaydi — cache kaliti mos kelishi uchun bitta joyda
export const TREND_PRODUCTS_INPUT: ProductsInquiry = {
	page: 1,
	limit: 8,
	sort: 'productLikes',
	direction: Direction.DESC,
	search: {},
};

TrendProducts.defaultProps = {
	initialInput: TREND_PRODUCTS_INPUT,
};

export default TrendProducts;
