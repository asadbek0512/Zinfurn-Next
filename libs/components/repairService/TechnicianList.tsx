import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import TechnicianCard from './TechnicianCard'; // Import qilindi

interface TechniciansProps {
	initialInput: AgentsInquiry;
}

const Technicians = (props: TechniciansProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [topTechnicians, setTopTechnicians] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: loadingTechnicians,
		data: techniciansData,
		error: techniciansError,
		refetch: refetchTechnicians,
	} = useQuery(GET_TECHNICIANS, {
		fetchPolicy: "cache-and-network",
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopTechnicians(data?.getTechnicians?.list);
		},
	});

	/** HANDLERS **/
		return (
            <Stack className={'top-technicians'}>
            <Stack className={'container'}>
                <Stack className={'info-box'}>
                    <Box component={'div'} className={'left'}>
                        <span>Top Technicians</span>
                        <p>Our top technicians are always ready to repair your furniture</p>
                    </Box>
                    <Box component={'div'} className={'right'}>
                        <div className={'more-box'}>
                            <span>See All Technicians</span>
                            <img src="/img/icons/rightup.svg" alt="" />
                        </div>
                    </Box>
                </Stack>
                <Stack className={'wrapper'}>
                    <Box component={'div'} className={'switch-btn swiper-technicians-prev'}>
                        <ArrowBackIosNewIcon />
                    </Box>
                    <Box component={'div'} className={'card-wrapper'}>
                        <Swiper
                            className={'top-technicians-swiper'}
                            slidesPerView={'auto'}
                            spaceBetween={29}
                            modules={[Autoplay, Navigation, Pagination]}
                            navigation={{
                                nextEl: '.swiper-technicians-next',
                                prevEl: '.swiper-technicians-prev',
                            }}
                        >
                            {topTechnicians.map((technician: Member) => (
                                <SwiperSlide className={'top-technicians-slide'} key={technician?._id}>
                                    <TechnicianCard technician={technician} key={technician?.memberNick} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Box>
                    <Box component={'div'} className={'switch-btn swiper-technicians-next'}>
                        <ArrowBackIosNewIcon />
                    </Box>
                </Stack>
            </Stack>
        </Stack>
        
		);
	}

Technicians.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default Technicians;
