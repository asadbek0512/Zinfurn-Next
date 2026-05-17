import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
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

interface TrendPropertiesProps {
	initialInput: PropertiesInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

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

			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: initialInput });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (trendProperties) console.log('trendProperties:', trendProperties);
	if (!trendProperties) return null;

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: '#f8f7f4', overflow: 'hidden', width: '100%' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 12px' }}>
					<div style={{ fontSize: '18px', fontWeight: 600, color: '#181a20' }}>
						{t('Trend Properties')} 🪑
					</div>
					<div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
						{t('Easily explore our carefully curated categories to find your favorite items')}
					</div>
				</div>

				{/* Swiper */}
				{trendProperties.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('Trends Empty')}</div>
				) : (
					<Swiper
						slidesPerView={2}
						spaceBetween={12}
						modules={[Autoplay]}
						touchStartPreventDefault={false}
						style={{ paddingLeft: '16px', paddingRight: '16px' }}
					>
						{trendProperties.map((property: Property) => {
							const discountPercent = property.propertyPrice && property.propertySalePrice
								? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
								: 0;
							const imgUrl = `${REACT_APP_API_URL}/${property.propertyImages?.[0]}`;
							return (
								<SwiperSlide key={property._id}>
									<div
										style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
										onClick={() => router.push({ pathname: '/property/detail', query: { id: property._id } })}
									>
										{/* Rasm */}
										<div style={{ position: 'relative', height: '170px', background: '#ffffff' }}>
											<img src={imgUrl} alt={property.propertyTitle} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', padding: '4px' }} />
											<div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
												{discountPercent > 0 && (
													<span style={{ background: '#ff6b35', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
														-{discountPercent}%
													</span>
												)}
												<span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
													{t(property.propertyCategory)}
												</span>
											</div>
										</div>
										{/* Info */}
										<div style={{ padding: '8px 10px' }}>
											<div style={{ fontSize: '13px', fontWeight: 500, color: '#181a20', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{property.propertyTitle}
											</div>
											<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
												<div>
													{property.propertySalePrice ? (
														<>
															<span style={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through', marginRight: '4px' }}>${property.propertyPrice}</span>
															<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>${property.propertySalePrice}</span>
														</>
													) : (
														<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>${property.propertyPrice}</span>
													)}
												</div>
												<div
													style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
													onClick={(e) => { e.stopPropagation(); likePropertyHandler(user, property._id); }}
												>
													{property?.meLiked?.[0]?.myFavorite
														? <FavoriteIcon style={{ fontSize: '16px', color: 'red' }} />
														: <FavoriteBorderIcon style={{ fontSize: '16px', color: '#bbb' }} />}
													<span style={{ fontSize: '12px', color: '#888' }}>{property.propertyLikes}</span>
												</div>
											</div>
										</div>
									</div>
								</SwiperSlide>
							);
						})}
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
