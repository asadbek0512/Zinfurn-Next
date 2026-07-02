import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination, Typography } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AgentCard from '../../libs/components/common/AgentCard';
import PropertyCardSkeleton from '../../libs/components/common/PropertyCardSkeleton';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Member } from '../../libs/types/member/member';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	// Skeleton kamida ~0.7s ko'rinsin (flash bo'lmasin)
	const [showSkeleton, setShowSkeleton] = useState(true);
	useEffect(() => {
		if (getAgentsLoading) {
			setShowSkeleton(true);
			return;
		}
		const timer = setTimeout(() => setShowSkeleton(false), 700);
		return () => clearTimeout(timer);
	}, [getAgentsLoading]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName(t('recent'));
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName(t('oldest'));
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName(t('likes'));
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName(t('views'));
				break;
		}
		setSortingOpen(false);
		setAnchorEl2(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<div id="mob-agent-list-page">
				{/* Top bar */}
				<div className="mob-agent-topbar">
					<input
						className="mob-agent-search"
						type="text"
						placeholder={t('search_for_agent')}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: searchText } });
							}
						}}
					/>
					<Button
						className="mob-agent-sort-btn"
						onClick={sortingClickHandler}
						endIcon={<KeyboardArrowDownRoundedIcon />}
					>
						{filterSortName}
					</Button>
					<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler}>
						<MenuItem onClick={sortingHandler} id="recent">{t('recent')}</MenuItem>
						<MenuItem onClick={sortingHandler} id="old">{t('oldest')}</MenuItem>
						<MenuItem onClick={sortingHandler} id="likes">{t('likes')}</MenuItem>
						<MenuItem onClick={sortingHandler} id="views">{t('views')}</MenuItem>
					</Menu>
				</div>

				{/* Grid */}
				{showSkeleton ? (
					<div className="mob-agent-grid">
						{Array.from({ length: 6 }).map((_, i) => (
							<PropertyCardSkeleton key={i} />
						))}
					</div>
				) : agents?.length === 0 ? (
					<div className="mob-agent-nodata">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('no_agents_found')}</p>
					</div>
				) : (
					<div className="mob-agent-grid">
						{agents.map((agent: Member) => (
							<AgentCard key={agent._id} agent={agent} likeMemberHandler={likeMemberHandler} />
						))}
					</div>
				)}

				{/* Pagination */}
				{agents.length !== 0 && (
					<div className="mob-agent-pagination">
						<Pagination
							page={currentPage}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={paginationChangeHandler}
							shape="circular"
							color="primary"
							size="small"
						/>
						<span className="mob-agent-total">
							{t('total')} {total} {t('agents_in_stock')}
						</span>
					</div>
				)}
			</div>
		);
	} else {
		return (
			<Stack className={'agent-list-page'}>
				<Stack className={'container'}>
					<Stack className={'filter'}>
						<Box component={'div'} className={'left'}>
							<input
								type="text"
								placeholder={t('search_for_agent')}
								value={searchText}
								onChange={(e: any) => setSearchText(e.target.value)}
								onKeyDown={(event: any) => {
									if (event.key == 'Enter') {
										setSearchFilter({
											...searchFilter,
											search: { ...searchFilter.search, text: searchText },
										});
									}
								}}
							/>
						</Box>
						<Box component={'div'} className={'right'}>
							<span>{t('sort_by')}</span>
							<div>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id={'recent'} disableRipple>
										{t('recent')}
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'old'} disableRipple>
										{t('oldest')}
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'likes'} disableRipple>
										{t('likes')}
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'views'} disableRipple>
										{t('views')}
									</MenuItem>
								</Menu>
							</div>
						</Box>
					</Stack>
					<Stack className={'card-wrap'}>
						{showSkeleton ? (
							Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
						) : agents?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>{t('no_agents_found')}</p>
							</div>
						) : (
							agents.map((agent: Member) => {
								return <AgentCard agent={agent} key={agent._id} likeMemberHandler={likeMemberHandler} />;
							})
						)}
					</Stack>

					<Stack className="pagination-config">
						{agents.length !== 0 && (
							<Stack className="pagination-box">
								<Pagination
									className="custom-pagination"
									page={currentPage}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={paginationChangeHandler}
									shape="circular"
								/>
							</Stack>
						)}

						{agents.length !== 0 && (
							<Stack className="total-result">
								<Typography>
									{t('total')} {total} {t('agents_in_stock')}
								</Typography>
							</Stack>
						)}
					</Stack>

				</Stack>
			</Stack>
		);
	}
};

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'ASC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);