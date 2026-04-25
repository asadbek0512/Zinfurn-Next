import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box, Link } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { GET_AGENTS } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next'; // Tarjima funksiyasi

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common'); // Tarjima hook

	const [topAgents, setTopAgents] = useState<Member[]>([]);

	const {
		loading: getPropertiesLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgemtsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list);
		},
	});

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: '#f8f7f4' }}>
				{/* Header */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 16px 12px' }}>
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
							<div style={{ width: '30px', height: '2px', background: '#cf6422' }} />
							<span style={{ fontSize: '12px', fontWeight: 500, color: '#000' }}>{t('Top Agents')}</span>
						</div>
						<div style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>{t('Our Top Agents')}</div>
					</div>
					<span onClick={() => router.push('/agent')} style={{ fontSize: '12px', color: '#cf6422', fontWeight: 500, cursor: 'pointer' }}>
						{t('All Agents')} →
					</span>
				</div>

				{/* Swiper */}
				{topAgents.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('No Agents')}</div>
				) : (
					<Swiper slidesPerView={2.2} spaceBetween={10} touchStartPreventDefault={false} style={{ paddingLeft: '16px', paddingRight: '8px' }}>
						{topAgents.map((agent: Member) => {
							const agentImage = agent?.memberImage
								? (agent.memberImage.startsWith('http') ? agent.memberImage : `${process.env.REACT_APP_API_URL}/${agent.memberImage}`)
								: '/img/profile/defaultUser.svg';
							return (
								<SwiperSlide key={agent._id}>
									<div style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
										onClick={() => router.push({ pathname: '/agent/detail', query: { agentId: agent._id } })}>
										<img src={agentImage} alt={agent.memberNick}
											style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
										<div style={{
											position: 'absolute', bottom: 0, left: 0, right: 0,
											background: 'rgba(45,55,72,0.88)', padding: '10px 12px',
											borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'
										}}>
											<div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{agent.memberNick}</div>
											<div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{t(agent.memberType)}</div>
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
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>{t('Top Agents')}</span>
							<p>{t('Our Top Agents always ready to serve you')}</p>
						</Box>
						<Link href="/property" className="view-button">
							{t('All Agents')}
						</Link>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
							>
								{topAgents.map((agent: Member) => (
									<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
										<TopAgentCard agent={agent} key={agent?.memberNick} />
									</SwiperSlide>
								))}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;

