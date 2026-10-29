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
import {
	ProductCategory,
	ProductColor,
	ProductCondition,
	ProductMaterial,
	ProductType,
} from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'next-i18next';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: ProductsInquiry;
	setSearchFilter: any;
	initialInput: ProductsInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [productCategory, setProductCategory] = useState<ProductCategory[]>(Object.values(ProductCategory));
	const [productType, setProductType] = useState<ProductType[]>(Object.values(ProductType));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);
	const { t } = useTranslation('common');

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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/products?input=${JSON.stringify({
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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/products?input=${JSON.stringify({
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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/products?input=${JSON.stringify({
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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/products?input=${JSON.stringify({
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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					})}`,
					`/products?input=${JSON.stringify({
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
	const productLocationSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] },
						})}`,
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, categoryList: [...(searchFilter?.search?.categoryList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.categoryList?.includes(value)) {
					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								categoryList: searchFilter?.search?.categoryList?.filter((item: string) => item !== value),
							},
						})}`,
						`/products?input=${JSON.stringify({
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

			} catch (err: unknown) {
				console.error('ERROR, productLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productTypeSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				if (isChecked) {
					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), value] },
						})}`,
						{ scroll: false },
					);
				} else if (searchFilter?.search?.typeList?.includes(value)) {
					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== value),
							},
						})}`,
						`/products?input=${JSON.stringify({
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

			} catch (err: unknown) {
				console.error('ERROR, productTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productConditionSelectHandler = useCallback(
		async (condition: ProductCondition) => {
			try {
				const currentConditions = searchFilter?.search?.conditionList || [];
				const isSelected = currentConditions.includes(condition);

				const newConditions = isSelected
					? currentConditions.filter((item) => item !== condition)
					: [...currentConditions, condition];

				await router.push(
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							conditionList: newConditions.length > 0 ? newConditions : undefined,
						},
					})}`,
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							conditionList: newConditions.length > 0 ? newConditions : undefined,
						},
					})}`,
					{ scroll: false },
				);
			} catch (err: unknown) {
				console.error('ERROR, productConditionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				const currentOptions = searchFilter?.search?.options || [];

				let newOptions = [];

				if (isChecked) {
					// Agar yangi option tanlansa, avvalgisini olib tashlab, yangisini qo'shamiz
					newOptions = [value];
				} else {
					// Agar joriy option olib tashlansa, bo'sh array
					newOptions = currentOptions.filter((option) => option !== value);
				}

				await router.push(
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							options: newOptions,
						},
					})}`,
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							options: newOptions,
						},
					})}`,
					{ scroll: false },
				);

			} catch (err: unknown) {
				console.error('ERROR, productOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productMaterialSelectHandler = useCallback(
		async (material: ProductMaterial | '') => {
			try {
				const currentList = searchFilter?.search?.materialList || [];

				if (material !== '') {
					const isSelected = currentList.includes(material);

					const newMaterialList = isSelected
						? currentList.filter((item) => item !== material)
						: [...currentList, material];

					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								materialList: newMaterialList,
							},
						})}`,
						undefined,
						{ scroll: false },
					);
				} else {
					const updatedFilter = { ...searchFilter };
					delete updatedFilter.search.materialList;

					setSearchFilter(updatedFilter);

					await router.push(
						`/products?input=${JSON.stringify({
							...updatedFilter,
							search: {
								...updatedFilter.search,
							},
						})}`,
						undefined,
						{ scroll: false },
					);
				}

			} catch (err: unknown) {
				console.error('ERROR, productMaterialSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productColorHandler = useCallback(
		async (color: ProductColor) => {
			const value = color; // Asosiy qiymat color bo'ladi

			try {
				if (searchFilter?.search?.colorList?.includes(value)) {
					await router.push(
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								colorList: searchFilter?.search?.colorList?.filter((item: string) => item !== value),
							},
						})}`,
						`/products?input=${JSON.stringify({
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
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, colorList: [...(searchFilter?.search?.colorList || []), value] },
						})}`,
						`/products?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, colorList: [...(searchFilter?.search?.colorList || []), value] },
						})}`,
						{ scroll: false },
					);
				}
			} catch (err: unknown) {
				console.error('ERROR, productColorHandler:', err);
			}
		},
		[searchFilter],
	);

	const productPriceHandler = useCallback(
		async (value: number, type: string) => {
			if (type == 'start') {
				await router.push(
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, start: value * 1 },
						},
					})}`,
					`/products?input=${JSON.stringify({
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
					`/products?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { ...searchFilter.search.pricesRange, end: value * 1 },
						},
					})}`,
					`/products?input=${JSON.stringify({
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
				`/products?input=${JSON.stringify(initialInput)}`,
				`/products?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		} catch (err: unknown) {
			console.error('ERROR, refreshHandler:', err);
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'} style={{ textShadow: 'none' }}>
						{t('productType')}
					</Typography>
					<Stack
						className="product-type1"
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}
					>
						{productType.map((type: string) => (
							<Stack className={'input-box'} key={type}>
								<Checkbox
									id={type}
									className="product-checkbox"
									color="default"
									size="small"
									value={type}
									onChange={productTypeSelectHandler}
									checked={(searchFilter?.search?.typeList || []).includes(type as ProductType)}
								/>
								<label style={{ cursor: 'pointer' }}>
									<Typography className="product_type">{t(type)}</Typography>
								</label>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack className="find-your-home" mb="30px">
					<p className="title">{t('category')}</p>
					<Stack
						className="product-location"
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}
					>
						{productCategory.map((location: string) => {
							return (
								<Stack className="input-box" key={location}>
									<Checkbox
										id={location}
										className="product-checkbox"
										color="default"
										size="small"
										value={location}
										checked={(searchFilter?.search?.categoryList || []).includes(location as ProductCategory)}
										onChange={productLocationSelectHandler}
									/>
									<label htmlFor={location} style={{ cursor: 'pointer' }}>
										<Typography className="product-type">{t(location)}</Typography>
									</label>
								</Stack>
							);
						})}
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('condition')}</Typography>
					<Stack className="button-group2">
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.conditionList?.includes(ProductCondition.NEW)
									? '2px solid var(--border-dark)'
									: '1px solid var(--border)',
								borderLeft: searchFilter?.search?.conditionList?.includes(ProductCondition.NEW) ? undefined : 'none',
							}}
							onClick={() => productConditionSelectHandler(ProductCondition.NEW)}
						>
							{t('NEW')}
						</Button>
						<Button
							sx={{
								borderRadius: 0,
								border: searchFilter?.search?.conditionList?.includes(ProductCondition.USED)
									? '2px solid var(--border-dark)'
									: '1px solid var(--border)',
								borderLeft: searchFilter?.search?.conditionList?.includes(ProductCondition.USED) ? undefined : 'none',
							}}
							onClick={() => productConditionSelectHandler(ProductCondition.USED)}
						>
							{t('USED')}
						</Button>
					</Stack>
				</Stack>

				<Stack className={'find-your-home'}>
					<Typography className={'title'}>{t('priceRange')}</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder={t('minPrice')}
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e) => {
								if (Number(e.target.value) >= 0) {
									productPriceHandler(Number(e.target.value), 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder={t('maxPrice')}
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e) => {
								if (Number(e.target.value) >= 0) {
									productPriceHandler(Number(e.target.value), 'end');
								}
							}}
						/>
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('options')}</Typography>
					<Stack className={'input-box'}>
						<Checkbox
							id={'ForSale'}
							className="product-checkbox"
							color="default"
							size="small"
							value={'productIsOnSale'}
							checked={(searchFilter?.search?.options || []).includes('productIsOnSale')}
							onChange={productOptionSelectHandler}
						/>
						<label htmlFor={'ForSale'} style={{ cursor: 'pointer' }}>
							<Typography className="product-type">{t('forSale')}</Typography>
						</label>
					</Stack>
					<Stack className={'input-box'}>
						<Checkbox
							id={'productInStock'}
							className="product-checkbox"
							color="default"
							size="small"
							value={'productInStock'}
							checked={(searchFilter?.search?.options || []).includes('productInStock')}
							onChange={productOptionSelectHandler}
						/>
						<label htmlFor={'productInStock'} style={{ cursor: 'pointer' }}>
							<Typography className="product-type">{t('inStock')}</Typography>
						</label>
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('material')}</Typography>
					<Stack className="button-group">
						{(['WOOD', 'METAL', 'PLASTIC', 'GLASS'] as ProductMaterial[]).map((material, index, array) => (
							<Button
								key={material}
								sx={{
									borderRadius: index === 0 ? '12px 0 0 12px' : index === array.length - 1 ? '0 12px 12px 0' : 0,
									border: searchFilter?.search?.materialList?.includes(material)
										? '2px solid var(--border-dark)'
										: '1px solid var(--border)',
									borderLeft:
										index !== 0 && !searchFilter?.search?.materialList?.includes(material) ? 'none' : undefined,
								}}
								onClick={() => productMaterialSelectHandler(material)}
							>
								{t(material)}
							</Button>
						))}
					</Stack>
				</Stack>

				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('color')}</Typography>

					<Stack
						className="button-group1"
						flexWrap="wrap"
						gap={1}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.categoryList) {
								setShowMore(false);
							}
						}}
					>
						{(['WHITE', 'BLACK', 'BROWN', 'GRAY', 'BEIGE', 'BLUE', 'GREEN'] as ProductColor[]).map((color) => (
							<Button
								key={color}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: '4px',
									borderRadius: '12px',
									border: searchFilter?.search?.colorList?.includes(color) ? '2px solid var(--border-dark)' : '1px solid #ffffff',
									backgroundColor: 'var(--surface)',
									color: 'var(--text-1)',
									minWidth: 'auto',
									fontSize: '13px',
									padding: '4px 10px',
									textTransform: 'capitalize',
									'&:hover': {
										backgroundColor: '#facc15',
									},
								}}
								onClick={() => productColorHandler(color)}
							>
								{t(color)}
								<Stack
									sx={{
										width: '20px',
										height: '20px',
										borderRadius: '50%',
										backgroundColor: color.toLowerCase(),
										border: '1px solid var(--border)',
									}}
								/>
							</Button>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'} style={{ textShadow: 'none' }}>
						{t('productType')}
					</Typography>
					<Stack
						className="product-type1"
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => { if (!searchFilter?.search?.categoryList) setShowMore(false); }}
					>
						{productType.map((type: string) => (
							<Stack className={'input-box'} key={type}>
								<Checkbox id={type} className="product-checkbox" color="default" size="small" value={type} onChange={productTypeSelectHandler} checked={(searchFilter?.search?.typeList || []).includes(type as ProductType)} />
								<label style={{ cursor: 'pointer' }}><Typography className="product_type">{t(type)}</Typography></label>
							</Stack>
						))}
					</Stack>
				</Stack>
				<Stack className="find-your-home" mb="30px">
					<p className="title">{t('category')}</p>
					<Stack className="product-location" onMouseEnter={() => setShowMore(true)} onMouseLeave={() => { if (!searchFilter?.search?.categoryList) setShowMore(false); }}>
						{productCategory.map((location: string) => (
							<Stack className="input-box" key={location}>
								<Checkbox id={location} className="product-checkbox" color="default" size="small" value={location} checked={(searchFilter?.search?.categoryList || []).includes(location as ProductCategory)} onChange={productLocationSelectHandler} />
								<label htmlFor={location} style={{ cursor: 'pointer' }}><Typography className="product-type">{t(location)}</Typography></label>
							</Stack>
						))}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('condition')}</Typography>
					<Stack className="button-group2">
						<Button sx={{ borderRadius: 0, border: searchFilter?.search?.conditionList?.includes(ProductCondition.NEW) ? '2px solid var(--border-dark)' : '1px solid var(--border)', borderLeft: searchFilter?.search?.conditionList?.includes(ProductCondition.NEW) ? undefined : 'none' }} onClick={() => productConditionSelectHandler(ProductCondition.NEW)}>{t('NEW')}</Button>
						<Button sx={{ borderRadius: 0, border: searchFilter?.search?.conditionList?.includes(ProductCondition.USED) ? '2px solid var(--border-dark)' : '1px solid var(--border)', borderLeft: searchFilter?.search?.conditionList?.includes(ProductCondition.USED) ? undefined : 'none' }} onClick={() => productConditionSelectHandler(ProductCondition.USED)}>{t('USED')}</Button>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>{t('priceRange')}</Typography>
					<Stack className="square-year-input">
						<input type="number" placeholder={t('minPrice')} min={0} value={searchFilter?.search?.pricesRange?.start ?? 0} onChange={(e) => { if (Number(e.target.value) >= 0) productPriceHandler(Number(e.target.value), 'start'); }} />
						<div className="central-divider"></div>
						<input type="number" placeholder={t('maxPrice')} value={searchFilter?.search?.pricesRange?.end ?? 0} onChange={(e) => { if (Number(e.target.value) >= 0) productPriceHandler(Number(e.target.value), 'end'); }} />
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('options')}</Typography>
					<Stack className={'input-box'}>
						<Checkbox id={'ForSale'} className="product-checkbox" color="default" size="small" value={'productIsOnSale'} checked={(searchFilter?.search?.options || []).includes('productIsOnSale')} onChange={productOptionSelectHandler} />
						<label htmlFor={'ForSale'} style={{ cursor: 'pointer' }}><Typography className="product-type">{t('forSale')}</Typography></label>
					</Stack>
					<Stack className={'input-box'}>
						<Checkbox id={'productInStock'} className="product-checkbox" color="default" size="small" value={'productInStock'} checked={(searchFilter?.search?.options || []).includes('productInStock')} onChange={productOptionSelectHandler} />
						<label htmlFor={'productInStock'} style={{ cursor: 'pointer' }}><Typography className="product-type">{t('inStock')}</Typography></label>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('material')}</Typography>
					<Stack className="button-group">
						{(['WOOD', 'METAL', 'PLASTIC', 'GLASS'] as ProductMaterial[]).map((material, index, array) => (
							<Button key={material} sx={{ borderRadius: index === 0 ? '12px 0 0 12px' : index === array.length - 1 ? '0 12px 12px 0' : 0, border: searchFilter?.search?.materialList?.includes(material) ? '2px solid var(--border-dark)' : '1px solid var(--border)', borderLeft: index !== 0 && !searchFilter?.search?.materialList?.includes(material) ? 'none' : undefined }} onClick={() => productMaterialSelectHandler(material)}>{t(material)}</Button>
						))}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>{t('color')}</Typography>
					<Stack className="button-group1" flexWrap="wrap" gap={1} onMouseEnter={() => setShowMore(true)} onMouseLeave={() => { if (!searchFilter?.search?.categoryList) setShowMore(false); }}>
						{(['WHITE', 'BLACK', 'BROWN', 'GRAY', 'BEIGE', 'BLUE', 'GREEN'] as ProductColor[]).map((color) => (
							<Button key={color} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', borderRadius: '12px', border: searchFilter?.search?.colorList?.includes(color) ? '2px solid var(--border-dark)' : '1px solid #ffffff', backgroundColor: 'var(--surface)', color: 'var(--text-1)', minWidth: 'auto', fontSize: '13px', padding: '4px 10px', textTransform: 'capitalize', '&:hover': { backgroundColor: '#facc15' } }} onClick={() => productColorHandler(color)}>
								{t(color)}
								<Stack sx={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color.toLowerCase(), border: '1px solid var(--border)' }} />
							</Button>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
