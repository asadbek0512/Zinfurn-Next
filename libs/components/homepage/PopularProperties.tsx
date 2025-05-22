// import React, { useState } from 'react';
// import { Stack, Box } from '@mui/material';
// import useDeviceDetect from '../../hooks/useDeviceDetect';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Navigation, Pagination } from 'swiper';
// import WestIcon from '@mui/icons-material/West';
// import EastIcon from '@mui/icons-material/East';
// import PopularPropertyCard from './PopularPropertyCard';
// import { Property } from '../../types/property/property';
// import Link from 'next/link';
// import { PropertiesInquiry } from '../../types/property/property.input';
// import { GET_PROPERTIES } from '../../../apollo/user/query';
// import { useQuery } from '@apollo/client';
// import { T } from '../../types/common';

// interface PopularPropertiesProps {
// 	initialInput: PropertiesInquiry;
// }

// const PopularProperties = (props: PopularPropertiesProps) => {
// 	const { initialInput } = props;
// 	const device = useDeviceDetect();
// 	const [popularProperties, setPopularProperties] = useState<Property[]>([]);

// 	/** APOLLO REQUESTS **/
// 		const {
// 			loading: getPropertiesLoading,
// 			data: getPropertiesData,
// 			error: getPropertiesError,
// 			refetch: getPropertiesRefetch,
// 		} = useQuery(GET_PROPERTIES, {
// 			fetchPolicy: "cache-and-network",
// 			variables: {input: initialInput},
// 			notifyOnNetworkStatusChange: true,
// 			onCompleted: (data: T) => {
// 				setPopularProperties(data?.getProperties?.list)
// 			}
// 		});
// 	/** HANDLERS **/

// 	if (!popularProperties) return null;

// 	if (device === 'mobile') {
// 		return (
// 			<Stack className={'popular-properties'}>
// 				<Stack className={'container'}>
// 					<Stack className={'info-box'}>
// 						<span>Popular properties</span>
// 					</Stack>
// 					<Stack className={'card-box'}>
// 						<Swiper
// 							className={'popular-property-swiper'}
// 							slidesPerView={'auto'}
// 							centeredSlides={true}
// 							spaceBetween={25}
// 							modules={[Autoplay]}
// 						>
// 							{popularProperties.map((property: Property) => {
// 								return (
// 									<SwiperSlide key={property._id} className={'popular-property-slide'}>
// 										<PopularPropertyCard property={property} />
// 									</SwiperSlide>
// 								);
// 							})}
// 						</Swiper>
// 					</Stack>
// 				</Stack>
// 			</Stack>
// 		);
// 	} else {
// 		return (
// 			<Stack className={'popular-properties'}>
// 				<Stack className={'container'}>
// 					<Stack className={'info-box'}>
// 						<Box component={'div'} className={'left'}>
// 							<span>Popular properties</span>
// 							<p>Popularity is based on views</p>
// 						</Box>
// 						<Box component={'div'} className={'right'}>
// 							<div className={'more-box'}>
// 								<Link href={'/property'}>
// 									<span>See All Categories</span>
// 								</Link>
// 								<img src="/img/icons/rightup.svg" alt="" />
// 							</div>
// 						</Box>
// 					</Stack>
// 					<Stack className={'card-box'}>
// 						<Swiper
// 							className={'popular-property-swiper'}
// 							slidesPerView={'auto'}
// 							spaceBetween={25}
// 							modules={[Autoplay, Navigation, Pagination]}
// 							navigation={{
// 								nextEl: '.swiper-popular-next',
// 								prevEl: '.swiper-popular-prev',
// 							}}
// 							pagination={{
// 								el: '.swiper-popular-pagination',
// 							}}
// 						>
// 							{popularProperties.map((property: Property) => {
// 								return (
// 									<SwiperSlide key={property._id} className={'popular-property-slide'}>
// 										<PopularPropertyCard property={property} />
// 									</SwiperSlide>
// 								);
// 							})}
// 						</Swiper>
// 					</Stack>
// 					<Stack className={'pagination-box'}>
// 						<WestIcon className={'swiper-popular-prev'} />
// 						<div className={'swiper-popular-pagination'}></div>
// 						<EastIcon className={'swiper-popular-next'} />
// 					</Stack>
// 				</Stack>
// 			</Stack>
// 		);
// 	}
// };

// PopularProperties.defaultProps = {
// 	initialInput: {
// 		page: 1,
// 		limit: 7,
// 		sort: 'propertyViews',
// 		direction: 'DESC',
// 		search: {},
// 	},
// };

// export default PopularProperties;


import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

const CraftSection = () => {
  return (
    <Box component="div" className="craft-section">
      <Container>
        <Stack className="craft-stack">
          {/* Left Column */}
          <Box component="div" className="craft-left">
            <Typography variant="h6" className="craft-heading">
              While we continue to be a part of nature by using natural materials in our designs,
              we bring our users together with craft.
            </Typography>
            <Box
              component="img"
              src="/img/banner/90.png"
              alt="Small Table"
              className="craft-image-left"
            />
          </Box>

          {/* Right Column */}
          <Box component="div" className="craft-right">
            <Box
              component="img"
              src="/img/banner/89.jpg"
              alt="Living Room"
              className="craft-image-right"
            />
            <Typography variant="body2" className="craft-text">
              Adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud. 
              Wusmod tempor incididunt.
            </Typography>
            <Button variant="contained" className="craft-button">
              Shop Collection
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CraftSection;


