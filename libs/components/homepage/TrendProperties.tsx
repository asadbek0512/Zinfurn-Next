import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import MobilePropertyCard from './MobilePropertyCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import TrendPropertyCard from './TrendPropertyCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useTranslation } from 'next-i18next';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useCurrency } from '../../context/CurrencyContext';

interface TrendPropertiesProps {
	initialInput: PropertiesInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { formatPrice } = useCurrency();

	const [trendProperties, setTrendProperties] = useState<Property[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTrendProperties(data?.getProperties?.list);
		},
	});

	/** HANDLERS **/
	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			const result = await likeTargetProperty({ variables: { input: id } });

			// Refetch o'rniga faqat bosilgan kartani lokal yangilaymiz — ro'yxat "lip-lip" qilmasin
			const updatedLikes = result?.data?.likeTargetProperty?.propertyLikes;
			setTrendProperties((prev) =>
				prev.map((p) =>
					p._id === id
						? {
								...p,
								propertyLikes: updatedLikes ?? p.propertyLikes,
								meLiked: p.meLiked?.[0]?.myFavorite
									? []
									: [{ memberId: user._id, likeRefId: id, myFavorite: true }],
						  }
						: p,
				),
			);
		} catch (err: any) {
			console.error('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!trendProperties) return null;

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: 'var(--bg-warm)', overflow: 'hidden', width: '100%' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 12px' }}>
					<div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-1)' }}>
						{t('Trend Properties')} 🪑
					</div>
					<div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>
						{t('Easily explore our carefully curated categories to find your favorite items')}
					</div>
				</div>

				{/* Swiper */}
				{trendProperties.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-4)' }}>{t('Trends Empty')}</div>
				) : (
					<Swiper
						slidesPerView={2}
						spaceBetween={12}
						modules={[Autoplay]}
						touchStartPreventDefault={false}
						style={{ paddingLeft: '16px', paddingRight: '16px' }}
					>
						{trendProperties.map((property: Property) => (
							<SwiperSlide key={property._id}>
								<MobilePropertyCard property={property} likePropertyHandler={likePropertyHandler} />
							</SwiperSlide>
						))}
					</Swiper>
				)}
			</div>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>
								{t('Trend Properties')} <img className={"icons"} src="img/icons/stol.png" alt="" />
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
						{trendProperties.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{t('Trends Empty')}
							</Box>
						) : (
							<Swiper
								className={'trend-property-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
							>
								{trendProperties.map((property: Property) => (
									<SwiperSlide key={property._id} className={'trend-property-slide'}>
										<TrendPropertyCard property={property} likePropertyHandler={likePropertyHandler} />
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

TrendProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendProperties;
