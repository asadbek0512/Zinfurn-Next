import React, { useCallback, useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCategory, PropertyColor, PropertyCondition, PropertyMaterial, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: any;
	initialInput: PropertiesInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [propertyCategory, setPropertyCategory] = useState<PropertyCategory[]>(Object.values(PropertyCategory));
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);


	/** LIFECYCLES **/
	useEffect(() => {
		const queryParams = JSON.stringify({
			...searchFilter,
			search: {
				...searchFilter.search,
			},
		});

		if (searchFilter?.search?.categoryList?.length == 0) {
			delete searchFilter.search.categoryList;
			setShowMore(false);
			router
				.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.typeList?.length == 0) {
			delete searchFilter.search.typeList;
			router
				.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.conditionList?.length == 0) {
			delete searchFilter.search.conditionList;
			router
				.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.options?.length == 0) {
			delete searchFilter.search.options;
			router
				.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.materialList?.length == 0) {
			delete searchFilter.search.materialList;
			router
				.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					{ scroll: false },
				)
				.then();
		}

		if (searchFilter?.search?.categoryList) setShowMore(true);
	}, [searchFilter]);

	/** HANDLERS **/
	const propertyLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.categoryList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (searchFilter?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('propertyLocationSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, propertyLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.typeList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				if (searchFilter?.search?.typeList?.length == 0) {
					alert('error');
				}

				console.log('propertyTypeSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyConditionSelectHandler = useCallback(
		async (condition: PropertyCondition) => {
			try {
				const currentConditions = searchFilter?.search?.conditionList || [];
				const isSelected = currentConditions.includes(condition);

				const newConditions = isSelected
					? currentConditions.filter((item) => item !== condition)
					: [...currentConditions, condition];

				await router.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							conditionList: newConditions.length > 0 ? newConditions : undefined,
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							conditionList: newConditions.length > 0 ? newConditions : undefined,
						},
					})}`,
					{ scroll: false }
				);
			} catch (err: any) {
				console.log("ERROR, propertyConditionSelectHandler:", err);
			}
		},
		[searchFilter]
	);

	const propertyOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, options: [...(searchFilter?.search?.options || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.options?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								options: searchFilter?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								options: searchFilter?.search?.options?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				}

				console.log('propertyOptionSelectHandler:', e.target.value);
			} catch (err: any) {
				console.log('ERROR, propertyOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);


	const propertyMaterialSelectHandler = useCallback(
		async (material: PropertyMaterial | '') => {
			try {
				const currentList = searchFilter?.search?.materialList || [];

				if (material !== '') {
					const isSelected = currentList.includes(material);

					const newMaterialList = isSelected
						? currentList.filter((item) => item !== material)
						: [...currentList, material];

					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								materialList: newMaterialList,
							},
						})}`,
						undefined,
						{ scroll: false }
					);
				} else {
					const updatedFilter = { ...searchFilter };
					delete updatedFilter.search.materialList;

					setSearchFilter(updatedFilter);

					await router.push(
						`/property?input=${JSON.stringify({
							...updatedFilter,
							search: {
								...updatedFilter.search,
							},
						})}`,
						undefined,
						{ scroll: false }
					);
				}

				console.log('propertyMaterialSelectHandler:', material);
			} catch (err: any) {
				console.log('ERROR, propertyMaterialSelectHandler:', err);
			}
		},
		[searchFilter]
	);


	const propertyColorHandler = useCallback(
		async (color: PropertyColor) => {
			const value = color; // Asosiy qiymat color bo'ladi

			try {
				if (searchFilter?.search?.colorList?.includes(value)) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								colorList: searchFilter?.search?.colorList?.filter((item: string) => item !== value),
							},
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								colorList: searchFilter?.search?.colorList?.filter((item: string) => item !== value),
							},
						})}`,
						{ scroll: false },
					);
				} else {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, colorList: [...(searchFilter?.search?.colorList || []), value] },
						})}`,
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, colorList: [...(searchFilter?.search?.colorList || []), value] },
						})}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, propertyColorHandler:', err);
			}
		},
		[searchFilter],
	);

	const propertyPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			} else {
				await router.push(
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					{ scroll: false },
				);
			}
		},
		[searchFilter],
	);

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await router.push(
				`/property?input=${JSON.stringify(initialInput)}`,
				`/property?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};


	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Home</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: '' },
											});
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>Property Type</Typography>
					<Stack
						className="property-type1"
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}
					>
						{propertyType.map((type: string) => (
							<Stack className={'input-box'} key={type}>
								<Checkbox
									id={type}
									className="property-checkbox"
									color="default"
									size="small"
									value={type}
									onChange={propertyTypeSelectHandler}
									checked={(searchFilter?.search?.typeList || []).includes(type as PropertyType)}
								/>
								<label style={{ cursor: 'pointer' }}>
									<Typography className="property_type">{type}</Typography>
								</label>
							</Stack>
						))}
					</Stack>

				</Stack>

				<Stack className="find-your-home" mb="30px">
					<p className="title">
						Location
					</p>
					<Stack
						className="property-location"
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}
					>
						{propertyCategory.map((location: string) => {
							return (
								<Stack className="input-box" key={location}>
									<Checkbox
										id={location}
										className="property-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(searchFilter?.search?.categoryList || []).includes(location as PropertyCategory)}
										onChange={propertyLocationSelectHandler}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="property-type">{location}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>


				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Condition</Typography>
					<Stack className="button-group">
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.conditionList?.includes(PropertyCondition.NEW) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.conditionList?.includes(PropertyCondition.NEW) ? undefined : 'none',
							}}
							onClick={() => propertyConditionSelectHandler(PropertyCondition.NEW)}
						>
							NEW
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.conditionList?.includes(PropertyCondition.USED) ? '2px solid #181A20' : '1px solid #b9b9b9',
								borderLeft: searchFilter?.search?.conditionList?.includes(PropertyCondition.USED) ? undefined : 'none',
							}}
							onClick={() => propertyConditionSelectHandler(PropertyCondition.USED)}
						>
							USED
						</Button>
					</Stack>




				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Material</Typography>
					<Stack className="button-group">
						{(['WOOD', 'METAL', 'PLASTIC', 'GLASS'] as PropertyMaterial[]).map((material, index, array) => (
							<Button
								key={material}
								sx={{
									borderRadius:
										index === 0
											? '12px 0 0 12px'
											: index === array.length - 1
												? '0 12px 12px 0'
												: 0,
									border: searchFilter?.search?.materialList?.includes(material)
										? '2px solid #181A20'
										: '1px solid #b9b9b9',
									borderLeft: index !== 0 && !searchFilter?.search?.materialList?.includes(material)
										? 'none'
										: undefined,
								}}
								onClick={() => propertyMaterialSelectHandler(material)}
							>
								{material.charAt(0) + material.slice(1).toLowerCase()}
							</Button>
						))}
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Color</Typography>

					<Stack className="button-group" flexWrap="wrap" gap={1}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}>
						{(
							['WHITE', 'BLACK', 'BROWN', 'GRAY', 'BEIGE', 'BLUE', 'GREEN'] as PropertyColor[]
						).map((color) => (
							<Button
								key={color}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: '4px',
									borderRadius: '12px',
									border: searchFilter?.search?.colorList?.includes(color)
										? '2px solid #181A20'
										: '1px solid #ffffff',
									backgroundColor: '#fff',
									color: '#000',
									minWidth: '100px',
									fontSize: '187px',
									padding: '4px 10px',
									textTransform: 'capitalize',
									'&:hover': {
										backgroundColor: '#facc15',
									},
								}}
								onClick={() => propertyColorHandler(color)}
							>
								{color.toLowerCase()}
								<Stack
									sx={{
										width: '20px',
										height: '20px',
										borderRadius: '50%',
										backgroundColor: color.toLowerCase(),
										border: '1px solid #999',
									}}
								/>
							</Button>
						))}
					</Stack>
				</Stack>


				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price Range</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="$ min"
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									propertyPriceHandler(e.target.value, 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="$ max"
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									propertyPriceHandler(e.target.value, 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
