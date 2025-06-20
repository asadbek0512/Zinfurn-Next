import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	PropertyCategory,
	PropertyColor,
	PropertyCondition,
	PropertyMaterial,
	PropertyType,
} from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

const thisYear = new Date().getFullYear();

interface HeaderFilterProps {
	initialInput: PropertiesInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const roomsRef: any = useRef();
	const colorRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openRooms, setOpenRooms] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [propertyCategory, setPropertyCategory] = useState<PropertyCategory[]>(Object.values(PropertyCategory));
	const [propertyMaterial, setPropertyMaterial] = useState<PropertyMaterial[]>(Object.values(PropertyMaterial));
	const [propertyColor, setPropertyColor] = useState<PropertyColor[]>(Object.values(PropertyColor));
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!roomsRef?.current?.contains(event.target)) {
				setOpenRooms(false);
			}

			if (!colorRef?.current?.contains(event.target)) {
				setOpenColor(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenType(false);
		setOpenColor(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenRooms(false);
		setOpenType(false);
		setOpenColor(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenRooms(false);
		setOpenColor(false);
	};

	const materialStateChangeHandler = () => {
		setOpenRooms((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
		setOpenColor(false);
	};

	const colorStateChangeHandler = () => {
		setOpenColor((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
		setOpenRooms(false);
	};

	const disableAllStateHandler = () => {
		setOpenRooms(false);
		setOpenType(false);
		setOpenLocation(false);
		setOpenColor(false);
	};

	const propertyCategorySelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						categoryList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyCategorySelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				materialStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyMaterialSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						materialList: [value],
					},
				});
				colorStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyMaterialSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyColorSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						colorList: [value],
					},
				});
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, propertyMaterialSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
	};

	const pushSearchHandler = async () => {
		try {
			if (searchFilter?.search?.categoryList?.length == 0) {
				delete searchFilter.search.categoryList;
			}

			if (searchFilter?.search?.typeList?.length == 0) {
				delete searchFilter.search.typeList;
			}

			if (searchFilter?.search?.materialList?.length == 0) {
				delete searchFilter.search.materialList;
			}

			if (searchFilter?.search?.colorList?.length == 0) {
				delete searchFilter.search.colorList;
			}

			await router.push(
				`/property?input=${JSON.stringify(searchFilter)}`,
				`/property?input=${JSON.stringify(searchFilter)}`,
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<Box component={'div'} className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
							<span>
								{searchFilter?.search?.categoryList ? t(searchFilter?.search?.categoryList[0]) : t('Category')}
							</span>
							<ExpandMoreIcon />
						</Box>
						{/* @ts-ignore */}
						<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
							<span>{searchFilter?.search?.typeList ? t(searchFilter?.search?.typeList[0]) : t('Property type')}</span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openRooms ? 'on' : ''}`} onClick={materialStateChangeHandler}>
							<span>
								{searchFilter?.search?.materialList ? t(searchFilter?.search?.materialList[0]) : t('Material')}
							</span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openColor ? 'on' : ''}`} onClick={colorStateChangeHandler}>
							<span>{searchFilter?.search?.colorList ? t(searchFilter?.search?.colorList[0]) : t('Color')}</span>
							<ExpandMoreIcon />
						</Box>
					</Stack>

					<Stack className={'search-box-other'}>
						<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}></Box>
						<Box className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</Box>
					</Stack>

					{/* MENU */}
					<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
						{propertyCategory.map((location: string) => {
							return (
								<div onClick={() => propertyCategorySelectHandler(location)} key={location}>
									<img src={`img/banner/cities/${location}.jpg`} alt="" />
									<span>{t(location)}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
						{propertyType.map((type: string) => {
							return (
								<div onClick={() => propertyTypeSelectHandler(type)} key={type}>
									<img src={`img/banner/types/${type}.jpg`} alt="" />
									<span>{t(type)}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-rooms ${openRooms ? 'on' : ''}`} ref={roomsRef}>
						{propertyMaterial.map((material: string) => {
							return (
								<div onClick={() => propertyMaterialSelectHandler(material)} key={material}>
									<img src={`img/banner/materials/${material}.jpg`} alt="" />
									<span>{t(material)}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-colors ${openColor ? 'on' : ''}`} ref={colorRef}>
						{propertyColor.map((color: string) => (
							<span
								key={color}
								className={color}
								onClick={() => propertyColorSelectHandler(color)}
								title={t(color)}
							></span>
						))}
					</div>
				</Stack>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
