import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
	Box,
	Button,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	OutlinedInput,
	Pagination,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import PropertyCard from '../../libs/components/property/PropertyCard';
import PropertyCardSkeleton from '../../libs/components/common/PropertyCardSkeleton';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Direction, Message } from '../../libs/enums/common.enum';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();

	// ViewMode bo'yicha limit aniqlash funksiyasi
	const getItemsPerPage = (viewMode: string) => {
		switch (viewMode) {
			case 'grid-1':
				return 6; // 1 ustunda 6 ta
			case 'grid-2':
				return 6; // 2 ustunda 6 ta
			case 'grid-4':
				return 9; // 4 ustunda 9 ta
			default:
				return 9;
		}
	};

	const [viewMode, setViewMode] = useState('grid-4');
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(() => {
		if (router?.query?.input) {
			return JSON.parse(router?.query?.input as string);
		}
		return {
			...initialInput,
			limit: getItemsPerPage('grid-4'),
		};
	});
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [searchText, setSearchText] = useState<string>(() => {
		try {
			if (router?.query?.input) return JSON.parse(router.query.input as string)?.search?.text ?? '';
		} catch {
			/* invalid input — bo'sh qoldiramiz */
		}
		return '';
	});
	const [filterOpen, setFilterOpen] = useState(false);
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getProperties?.list);
			setTotal(data?.getProperties?.metaCounter[0]?.total);
		},
	});

	// Mobilda default 2-ustun grid (PC'da grid-4 qoladi)
	useEffect(() => {
		if (device === 'mobile' && !router?.query?.input) {
			setViewMode('grid-2');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [device]);

	// Skeleton kamida ~0.7s ko'rinsin (flash bo'lmasin — silliq UX)
	const [showSkeleton, setShowSkeleton] = useState(true);
	useEffect(() => {
		if (getPropertiesLoading) {
			setShowSkeleton(true);
			return;
		}
		const timer = setTimeout(() => setShowSkeleton(false), 700);
		return () => clearTimeout(timer);
	}, [getPropertiesLoading]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		console.log('searchFilter:', searchFilter);
	}, [searchFilter]);

	/** LIVE QIDIRUV: yozishni to'xtatgach ~0.4s da avtomatik qidiradi (Enter shart emas). */
	useEffect(() => {
		const timer = setTimeout(() => {
			const currentText = searchFilter.search?.text ?? '';
			if (searchText === currentText) return;
			const newSearchFilter: PropertiesInquiry = {
				...searchFilter,
				search: { ...searchFilter.search, text: searchText || undefined },
				page: 1,
			};
			router.replace(`/property?input=${JSON.stringify(newSearchFilter)}`, undefined, { scroll: false, shallow: true });
			setSearchFilter(newSearchFilter);
			setCurrentPage(1);
		}, 400);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText]);

	// ViewMode o'zgarganda limit ni yangilash
	useEffect(() => {
		const currentLimit = getItemsPerPage(viewMode);
		if (searchFilter.limit !== currentLimit) {
			const newSearchFilter = {
				...searchFilter,
				limit: currentLimit,
			};
			setSearchFilter(newSearchFilter);
		}
	}, [viewMode]);

	/** HANDLERS **/

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			//execute likePropertyHandler Mutation
			await likeTargetProperty({ variables: { input: id } });

			//execute getPropertiesRefetch
			await getPropertiesRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const newSearchFilter = {
			...searchFilter,
			page: value,
		};

		await router.push(
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			{
				scroll: false,
			},
		);
		setSearchFilter(newSearchFilter);
		setCurrentPage(value);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let newSearchFilter = { ...searchFilter };

		switch (e.currentTarget.id) {
			case 'new':
				newSearchFilter = { ...searchFilter, sort: 'createdAt', direction: Direction.ASC, page: 1 };
				setFilterSortName('New');
				break;
			case 'lowest':
				newSearchFilter = { ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC, page: 1 };
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				newSearchFilter = { ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC, page: 1 };
				setFilterSortName('Highest Price');
				break;
		}

		// URL ni yangilash
		await router.push(
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			{ scroll: false },
		);

		setSearchFilter(newSearchFilter);
		setCurrentPage(1);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const refreshHandler = async () => {
		try {
			setSearchText('');
			const refreshedInput = {
				...initialInput,
				limit: getItemsPerPage(viewMode),
			};

			await router.push(
				`/property?input=${JSON.stringify(refreshedInput)}`,
				`/property?input=${JSON.stringify(refreshedInput)}`,
				{ scroll: false },
			);

			setSearchFilter(refreshedInput);
			setCurrentPage(1);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const viewModeHandler = async (mode: string) => {
		// ViewMode o'zgarishi
		setViewMode(mode);

		// Yangi limit va sahifani 1-ga qaytarish
		const newLimit = getItemsPerPage(mode);
		const newSearchFilter = {
			...searchFilter,
			limit: newLimit,
			page: 1,
		};

		// URL va state ni yangilash
		await router.push(
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			{ scroll: false },
		);

		setSearchFilter(newSearchFilter);
		setCurrentPage(1);
	};

	const searchHandler = async () => {
		const newSearchFilter = {
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
			page: 1,
		};
		await router.push(
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			{ scroll: false },
		);

		setSearchFilter(newSearchFilter);
		setCurrentPage(1);
	};

	const clearSearchHandler = async () => {
		setSearchText('');
		const newSearchFilter = {
			...searchFilter,
			search: { ...searchFilter.search, text: '' },
			page: 1,
		};

		await router.push(
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			`/property?input=${JSON.stringify(newSearchFilter)}`,
			{ scroll: false },
		);

		setSearchFilter(newSearchFilter);
		setCurrentPage(1);
	};

	if (device === 'mobile') {
		return (
			<div id="mob-property-list-page">
				{/* Filter Drawer */}
				<Drawer anchor="left" open={filterOpen} onClose={() => setFilterOpen(false)}>
					<Stack className="mob-filter-drawer">
						<Stack className="mob-filter-header">
							<Typography className="mob-filter-title">{t('filter')}</Typography>
							<IconButton onClick={() => setFilterOpen(false)}><CloseIcon /></IconButton>
						</Stack>
						{/* @ts-ignore */}
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>
				</Drawer>

				{/* Top Bar */}
				<Stack className="mob-top-bar">
					<Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
						<IconButton className="mob-filter-btn" onClick={() => setFilterOpen(true)}>
							<TuneIcon />
						</IconButton>
						<div className="mob-view-modes" style={{ display: 'flex', gap: '6px' }}>
							<IconButton
								onClick={() => viewModeHandler('grid-1')}
								size="small"
								style={{ padding: '6px', background: viewMode === 'grid-1' ? '#6b3f29' : 'var(--text-1)', color: '#fff', transition: 'all 0.3s ease' }}
							>
								<ViewStreamIcon style={{ fontSize: '18px' }} />
							</IconButton>
							<IconButton
								onClick={() => viewModeHandler('grid-2')}
								size="small"
								style={{ padding: '6px', background: viewMode === 'grid-2' ? '#6b3f29' : 'var(--text-1)', color: '#fff', transition: 'all 0.3s ease' }}
							>
								<ViewModuleIcon style={{ fontSize: '18px' }} />
							</IconButton>
						</div>
					</Stack>

					<Stack className="mob-search-box" sx={{ flex: 1, ml: 1, mr: 1 }}>
						<OutlinedInput
							value={searchText}
							type="text"
							className="mob-search-input"
							placeholder={t('search_placeholder')}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => { if (event.key === 'Enter') searchHandler(); }}
							endAdornment={searchText ? <CancelRoundedIcon onClick={clearSearchHandler} style={{ cursor: 'pointer', fontSize: 16 }} /> : null}
						/>
					</Stack>
					<Button className="mob-sort-btn" onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
						{t(filterSortName)}
					</Button>
					<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler}>
						<MenuItem onClick={sortingHandler} id="new">{t('new')}</MenuItem>
						<MenuItem onClick={sortingHandler} id="lowest">{t('lowest_price')}</MenuItem>
						<MenuItem onClick={sortingHandler} id="highest">{t('highest_price')}</MenuItem>
					</Menu>
				</Stack>

				{/* Card List */}
				<Stack className={`mob-card-list ${viewMode}`}>
					{showSkeleton ? (
							Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
						) : properties?.length === 0 ? (
						<Stack className="mob-no-data">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>{t('no_properties_found')}</Typography>
						</Stack>
					) : (
						properties.map((property: Property) => (
							<PropertyCard
								property={property}
								likePropertyHandler={likePropertyHandler}
								key={property?._id}
							/>
						))
					)}
				</Stack>

				{/* Pagination */}
				{properties.length !== 0 && (
					<Stack className="mob-pagination">
						<Pagination
							page={currentPage}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={handlePaginationChange}
							shape="rounded"
							color="primary"
						/>
						<Typography className="mob-total">{t('total_properties_count', { count: total })}</Typography>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
		<div id="property-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Stack className={'property-page'}>
					<Stack className={'filter-config'}>
						{/* @ts-ignore */}
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>

					<Stack className="main-config" mb={'76px'}>
						<Stack component={'div'} className={'top-bar'}>
							<Box component={'div'} className={'view-modes'}>
								<Button
									className={`view-btn ${viewMode === 'grid-1' ? 'active' : ''}`}
									onClick={() => viewModeHandler('grid-1')}
								>
									<ViewStreamIcon />
								</Button>

								<Button
									className={`view-btn ${viewMode === 'grid-2' ? 'active' : ''}`}
									onClick={() => viewModeHandler('grid-2')}
								>
									<ViewListIcon />
								</Button>

								<Button
									className={`view-btn ${viewMode === 'grid-4' ? 'active' : ''}`}
									onClick={() => viewModeHandler('grid-4')}
								>
									<ViewModuleIcon />
								</Button>
							</Box>

							<Stack className={'find-your-home'} mb={'40px'}>
								<Stack className={'input-box1'}>
									<OutlinedInput
										value={searchText}
										type={'text'}
										className={'search-input'}
										placeholder={t('search_placeholder')}
										onChange={(e: any) => setSearchText(e.target.value)}
										onKeyDown={(event: any) => {
											if (event.key === 'Enter') {
												searchHandler();
											}
										}}
										endAdornment={
											<>
												<CancelRoundedIcon onClick={clearSearchHandler} style={{ cursor: 'pointer' }} />
											</>
										}
									/>
									<img src={'/img/icons/search_icon.png'} alt={''} />
									<Tooltip title={t('reset')}>
										<IconButton onClick={refreshHandler}>
											<RefreshIcon />
										</IconButton>
									</Tooltip>
								</Stack>
							</Stack>

							<Box component={'div'} className={'right'}>
								<span className="sort">{t('sort_by')}</span>
								<div>
									<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
										{t(filterSortName)}
									</Button>
									<Menu
										anchorEl={anchorEl}
										open={sortingOpen}
										onClose={sortingCloseHandler}
										sx={{ paddingTop: '5px' }}
									>
										<MenuItem
											onClick={sortingHandler}
											id={'new'}
											disableRipple
											sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 18px' }}
										>
											{t('new')}
										</MenuItem>
										<MenuItem
											onClick={sortingHandler}
											id={'lowest'}
											disableRipple
											sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
										>
											{t('lowest_price')}
										</MenuItem>
										<MenuItem
											onClick={sortingHandler}
											id={'highest'}
											disableRipple
											sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
										>
											{t('highest_price')}
										</MenuItem>
									</Menu>
								</div>
							</Box>
						</Stack>

						<Stack className={`list-config ${viewMode}`}>
							{showSkeleton ? (
								Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)
							) : properties?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p style={{ color: 'black' }}>{t('no_properties_found')}</p>
								</div>
							) : (
								properties.map((property: Property) => {
									return (
										<PropertyCard property={property} likePropertyHandler={likePropertyHandler} key={property?._id} />
									);
								})
							)}
						</Stack>

						<Stack className="pagination-config">
							{properties.length !== 0 && (
								<Stack className="pagination-box">
									<Pagination
										className="custom-pagination"
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
									/>
								</Stack>
							)}

							{properties.length !== 0 && (
								<Stack className="total-result">
									<Typography>{t('total_properties_count', { count: total })}</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
	}
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9, // Default limit
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(PropertyList);
