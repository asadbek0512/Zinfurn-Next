import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography, Select, MenuItem, FormControl } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	ProductCategory,
	ProductColor,
	ProductCondition,
	ProductMaterial,
	ProductType,
} from '../../enums/product.enum';
import { REACT_APP_API_URL, productColorList } from '../../config';
import { ProductInput } from '../../types/product/product.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import ArModelField from './ArModelField';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import { getErrorMessage } from '../../types/common';

// Flash sale oynasi: kamida 10, ko'pi bilan 15 kun. Sale'lar navbatma-navbat
// tugab, keyingisi chiqishi uchun shu oraliq ushlab turiladi.
const MIN_SALE_DAYS = 10;
const MAX_SALE_DAYS = 15;

const toDateInputValue = (date: Date): string => date.toISOString().slice(0, 10);
const saleDateInputValue = (daysFromNow: number): string => {
	const date = new Date();
	date.setDate(date.getDate() + daysFromNow);
	return toDateInputValue(date);
};
const minSaleDateInputValue = (): string => saleDateInputValue(MIN_SALE_DAYS);
const maxSaleDateInputValue = (): string => saleDateInputValue(MAX_SALE_DAYS);

const AddProduct = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertProductData, setInsertProductData] = useState<ProductInput>(initialValues);
	const [productType, setProductType] = useState<ProductType[]>(Object.values(ProductType));
	const [productLocation, setProductLocation] = useState<ProductCategory[]>(Object.values(ProductCategory));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getProductLoading,
		data: getProductData,
		error: getProductError,
		refetch: getProductRefetch,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: {
			input: router.query.productId,
		},
		skip: !router.query.productId,
		onCompleted: (data) => {
			if (data?.getProduct) {
				setInsertProductData({
					productTitle: data.getProduct.productTitle,
					productPrice: data.getProduct.productPrice,
					productType: data.getProduct.productType,
					productCategory: data.getProduct.productCategory,
					productDesc: data.getProduct.productDesc,
					productMaterial: data.getProduct.productMaterial,
					productColor: data.getProduct.productColor,
					productSize: data.getProduct.productSize,
					productSalePrice: data.getProduct.productSalePrice,
					productIsOnSale: data.getProduct.productIsOnSale,
					productStock: data.getProduct.productStock,
					productSaleExpiresAt: data.getProduct.productSaleExpiresAt,
					productInStock: data.getProduct.productInStock,
					productCondition: data.getProduct.productCondition,
					productImages: data.getProduct.productImages,
					productArModel: data.getProduct.productArModel,
				});
			}
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.productId) {
			getProductRefetch();
		}
	}, [router.query.productId]);

	/** HANDLERS **/
	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length == 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'product',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;

			setInsertProductData({ ...insertProductData, productImages: responseImages });
		} catch (err: unknown) {
			console.error('err: ', getErrorMessage(err));
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	}
	// Backend ProductInput DTO talablari: productTitle @Length(3,100), productDesc @Length(5,500)
	const TITLE_MIN = 3;
	const DESC_MIN = 5;
	const titleTooShort = (insertProductData.productTitle?.trim().length ?? 0) < TITLE_MIN;
	const descTooShort = (insertProductData.productDesc?.trim().length ?? 0) < DESC_MIN;

	const doDisabledCheck = (): boolean => {
		if (
			titleTooShort ||
			insertProductData.productPrice === 0 ||
			!insertProductData.productType ||
			!insertProductData.productCategory ||
			!insertProductData.productCondition ||
			!insertProductData.productMaterial ||
			!insertProductData.productColor ||
			descTooShort ||
			(insertProductData.productImages?.length ?? 0) === 0 // Optional chaining + nullish coalescing
		) {
			return true;
		}
		return false;
	};

	const insertProductHandler = useCallback(async () => {
		try {
			const result = await createProduct({
				variables: {
					input: insertProductData,
				},
			});
			await sweetMixinSuccessAlert('This product has been created successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProducts',
				},
			});
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	}, [insertProductData]);

	const updateProductHandler = useCallback(async () => {
		try {
			const updateData = {
				_id: getProductData?.getProduct?._id,
				productTitle: insertProductData.productTitle,
				productPrice: insertProductData.productPrice,
				productType: insertProductData.productType,
				productCategory: insertProductData.productCategory,
				productDesc: insertProductData.productDesc,
				productMaterial: insertProductData.productMaterial,
				productColor: insertProductData.productColor,
				productSize: insertProductData.productSize,
				productSalePrice: insertProductData.productSalePrice,
				productIsOnSale: insertProductData.productIsOnSale,
				productSaleExpiresAt: insertProductData.productSaleExpiresAt,
				productStock: insertProductData.productStock,
				productInStock: insertProductData.productInStock,
				productCondition: insertProductData.productCondition,
				productImages: insertProductData.productImages,
				productArModel: insertProductData.productArModel,
				productStatus: getProductData?.getProduct?.productStatus,
			};

			const result = await updateProduct({
				variables: {
					input: updateData,
				},
			});
			await sweetMixinSuccessAlert('This product has been updated successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProducts',
				},
			});
		} catch (err: unknown) {
			sweetErrorHandling(err).then();
		}
	}, [insertProductData, getProductData?.getProduct?._id, getProductData?.getProduct?.productStatus]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}


	if (device === 'mobile') {
		const isEdit = !!router.query.productId;
		return (
			<div id="mob-addproduct">
				<div className="mob-addprop-header">
					<h2>{isEdit ? t('Edit Product') : t('Add New Product')}</h2>
					<span>{t('We are glad to see you again!')}</span>
				</div>

				<div className="mob-addprop-form">
					<div className="mob-addprop-field">
						<label>{t('Title')}</label>
						<input
							type="text"
							placeholder={t('Title')}
							value={insertProductData.productTitle}
							onChange={({ target: { value } }) =>
								setInsertProductData({ ...insertProductData, productTitle: value })
							}
						/>
						{titleTooShort && insertProductData.productTitle !== '' && (
							<span style={{ color: '#e03131', fontSize: 12 }}>{t('At least 3 characters')}</span>
						)}
					</div>

					<div className="mob-addprop-row">
						<div className="mob-addprop-field">
							<label>{t('Price')}</label>
							<input
								type="number"
								placeholder={t('Price')}
								value={insertProductData.productPrice || ''}
								onChange={({ target: { value } }) => {
									const parsed = parseInt(value, 10);
									setInsertProductData({ ...insertProductData, productPrice: isNaN(parsed) ? 0 : parsed });
								}}
							/>
						</div>
						<div className="mob-addprop-field">
							<label>{t('Stock (empty = unlimited)')}</label>
							<input
								type="number"
								min={0}
								placeholder={t('Unlimited')}
								value={insertProductData.productStock ?? ''}
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productStock: value === '' ? undefined : Math.max(0, Number(value)),
									})
								}
							/>
						</div>
						<div className="mob-addprop-field">
							<label>{t('Type')}</label>
							<Select
								className="mob-addprop-select"
								value={insertProductData.productType || ''}
								displayEmpty
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productType: value as ProductType,
									})
								}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: 300,
											'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
										}
									}
								}}
							>
								<MenuItem disabled value="">{t('Select')}</MenuItem>
								{Object.values(ProductType).map((type) => (
									<MenuItem value={type} key={type}>{t(type)}</MenuItem>
								))}
							</Select>
						</div>
					</div>

					<div className="mob-addprop-row">
						<div className="mob-addprop-field">
							<label>{t('Category')}</label>
							<Select
								className="mob-addprop-select"
								value={insertProductData.productCategory || ''}
								displayEmpty
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productCategory: value as ProductCategory,
									})
								}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: 300,
											'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
										}
									}
								}}
							>
								<MenuItem disabled value="">{t('Select')}</MenuItem>
								{Object.values(ProductCategory).map((category) => (
									<MenuItem key={category} value={category}>{t(category)}</MenuItem>
								))}
							</Select>
						</div>
						<div className="mob-addprop-field">
							<label>{t('Size')}</label>
							<input
								type="text"
								placeholder={t('Size (e.g. 120x80 cm)')}
								value={insertProductData.productSize || ''}
								onChange={({ target: { value } }) =>
									setInsertProductData({ ...insertProductData, productSize: value })
								}
							/>
						</div>
					</div>

					<div className="mob-addprop-row">
						<div className="mob-addprop-field">
							<label>{t('On Sale')}</label>
							<Select
								className="mob-addprop-select"
								value={
									insertProductData.productIsOnSale === undefined
										? 'select'
										: insertProductData.productIsOnSale
										? 'yes'
										: 'no'
								}
								displayEmpty
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productIsOnSale: value === 'yes',
									})
								}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: 300,
											'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
										}
									}
								}}
							>
								<MenuItem disabled value="select">{t('Select')}</MenuItem>
								<MenuItem value="yes">{t('Yes')}</MenuItem>
								<MenuItem value="no">{t('No')}</MenuItem>
							</Select>
						</div>
						{insertProductData.productIsOnSale && (
							<div className="mob-addprop-field">
								<label>{t('Sale Price')}</label>
								<input
									type="number"
									placeholder={t('Sale Price')}
									value={insertProductData.productSalePrice || ''}
									onChange={({ target: { value } }) =>
										setInsertProductData({
											...insertProductData,
											productSalePrice: value === '' ? undefined : Number(value),
										})
									}
								/>
							</div>
						)}
					</div>
					{insertProductData.productIsOnSale && (
						<div className="mob-addprop-field">
							<label>{t('Sale Expires At')}</label>
							<input
								type="date"
								min={minSaleDateInputValue()}
								max={maxSaleDateInputValue()}
								value={
									insertProductData.productSaleExpiresAt
										? new Date(insertProductData.productSaleExpiresAt).toISOString().slice(0, 10)
										: ''
								}
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productSaleExpiresAt: value === '' ? undefined : new Date(value),
									})
								}
							/>
						</div>
					)}

					<div className="mob-addprop-row">
						<div className="mob-addprop-field">
							<label>{t('Condition')}</label>
							<Select
								className="mob-addprop-select"
								value={insertProductData.productCondition || ''}
								displayEmpty
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productCondition: value as ProductCondition,
									})
								}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: 300,
											'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
										}
									}
								}}
							>
								<MenuItem disabled value="">{t('Select')}</MenuItem>
								{Object.values(ProductCondition).map((condition) => (
									<MenuItem key={condition} value={condition}>{t(condition)}</MenuItem>
								))}
							</Select>
						</div>
						<div className="mob-addprop-field">
							<label>{t('Material')}</label>
							<Select
								className="mob-addprop-select"
								value={insertProductData.productMaterial || ''}
								displayEmpty
								onChange={({ target: { value } }) =>
									setInsertProductData({
										...insertProductData,
										productMaterial: value as ProductMaterial,
									})
								}
								MenuProps={{
									PaperProps: {
										sx: {
											maxHeight: 300,
											'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
										}
									}
								}}
							>
								<MenuItem disabled value="">{t('Select')}</MenuItem>
								{Object.values(ProductMaterial).map((material) => (
									<MenuItem key={material} value={material}>{t(material)}</MenuItem>
								))}
							</Select>
						</div>
					</div>

					<div className="mob-addprop-field">
						<label>{t('Color')}</label>
						<Select
							className="mob-addprop-select"
							value={insertProductData.productColor || ''}
							displayEmpty
							onChange={({ target: { value } }) =>
								setInsertProductData({
									...insertProductData,
									productColor: value as ProductColor,
								})
							}
							MenuProps={{
								PaperProps: {
									sx: {
										maxHeight: 300,
										'& .MuiMenuItem-root': { fontSize: '16px', padding: '12px 16px', color: 'var(--text-1)' }
									}
								}
							}}
						>
							<MenuItem disabled value="">{t('Select')}</MenuItem>
							{productColorList.map((color: ProductColor) => (
								<MenuItem key={color} value={color}>{t(color)}</MenuItem>
							))}
						</Select>
					</div>

					<div className="mob-addprop-field">
						<label>{t('Description')}</label>
						<textarea
							placeholder={t('Write some details...')}
							value={insertProductData.productDesc || ''}
							onChange={({ target: { value } }) =>
								setInsertProductData({ ...insertProductData, productDesc: value })
							}
						/>
						{descTooShort && (insertProductData.productDesc || '') !== '' && (
							<span style={{ color: '#e03131', fontSize: 12 }}>{t('At least 5 characters')}</span>
						)}
					</div>

					{/* Image Upload */}
					<div className="mob-addprop-upload">
						<label>{t('Upload Images')} <span>({insertProductData.productImages?.length || 0}/5)</span></label>
						<div className="mob-addprop-gallery">
							{insertProductData?.productImages?.map((image: string, idx: number) => {
								return (
									<div key={idx} className="mob-addprop-img-item">
										<img src={`${REACT_APP_API_URL}/${image}`} alt="" loading="lazy" decoding="async" />
										<div className="delete-btn" onClick={() => {
											const updatedImages = [...(insertProductData.productImages || [])];
											updatedImages.splice(idx, 1);
											setInsertProductData({ ...insertProductData, productImages: updatedImages })
										}}>
											&times;
										</div>
									</div>
								);
							})}
							{(!insertProductData.productImages || insertProductData.productImages.length < 5) && (
								<div className="mob-addprop-img-add" onClick={() => inputRef.current.click()}>
									<span>+</span>
								</div>
							)}
							<input
								ref={inputRef}
								type="file"
								hidden
								onChange={uploadImages}
								multiple
								accept="image/jpg, image/jpeg, image/png"
							/>
						</div>
						<p>{t('JPEG or PNG • Min 2048x768 (Up to 5 images)')}</p>
					</div>

					<ArModelField
						imageUrl={
							insertProductData.productImages?.[0]
								? `${REACT_APP_API_URL}/${insertProductData.productImages[0]}`
								: undefined
						}
						value={insertProductData.productArModel}
						onChange={(productArModel) => setInsertProductData({ ...insertProductData, productArModel })}
					/>

					<button
						className="mob-addprop-btn"
						disabled={doDisabledCheck()}
						onClick={isEdit ? updateProductHandler : insertProductHandler}
					>
						{t('Save Product')}
					</button>
				</div>
			</div>
		);
	} else {
		return (
			<div id="add-product-page">
				<Stack className="main-title-box">
					<Typography className="main-title">{t('Add New Product')}</Typography>
					<Typography className="sub-title">{t('We are glad to see you again!')}</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							<Stack className="config-column">
								<Typography className="title">{t('Title')}</Typography>
								<input
									type="text"
									className="description-input"
									placeholder={t('Title')}
									value={insertProductData.productTitle}
									onChange={({ target: { value } }) =>
										setInsertProductData({ ...insertProductData, productTitle: value })
									}
								/>
								{titleTooShort && insertProductData.productTitle !== '' && (
									<span style={{ color: '#e03131', fontSize: 12 }}>{t('At least 3 characters')}</span>
								)}
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Price')}</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={t('Price')}
										value={insertProductData.productPrice}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productPrice: parseInt(value) })
										}
									/>
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Stock (empty = unlimited)')}</Typography>
									<input
										type="number"
										min={0}
										className="description-input"
										placeholder={t('Unlimited')}
										value={insertProductData.productStock ?? ''}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productStock: value === '' ? undefined : Math.max(0, Number(value)),
											})
										}
									/>
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Type')}</Typography>
									<select
										className="select-description"
										value={insertProductData.productType}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productType: value as ProductType,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(ProductType).map((type) => (
											<option value={type} key={type}>
												{t(type)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Category')}</Typography>

									<select
										className="select-description"
										value={insertProductData.productCategory}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productCategory: value as ProductCategory,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(ProductCategory).map((category) => (
											<option key={category} value={category}>
												{t(category)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Size')}</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={t('Size (e.g. 120x80x75 cm)')}
										value={insertProductData.productSize || ''}
										onChange={({ target: { value } }) =>
											setInsertProductData({ ...insertProductData, productSize: value })
										}
									/>
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('On Sale')}</Typography>
									<select
										className="select-description"
										value={
											insertProductData.productIsOnSale === undefined
												? 'select'
												: insertProductData.productIsOnSale
												? 'yes'
												: 'no'
										}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productIsOnSale: value === 'yes',
											})
										}
									>
										<option disabled value="select">
											{t('Select')}
										</option>
										<option value="yes">{t('Yes')}</option>
										<option value="no">{t('No')}</option>
									</select>
									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>
							</Stack>

							{insertProductData.productIsOnSale && (
								<Stack direction="row" spacing={2} className="config-row">
									<Stack className="price-year-after-price">
										<Typography className="title">{t('Sale Price')}</Typography>
										<input
											type="number"
											className="description-input"
											placeholder={t('Sale Price')}
											value={insertProductData.productSalePrice ?? ''}
											onChange={({ target: { value } }) =>
												setInsertProductData({
													...insertProductData,
													productSalePrice: value === '' ? undefined : Number(value),
												})
											}
										/>
										<div className="divider"></div>
									</Stack>

									<Stack className="price-year-after-price">
										<Typography className="title">{t('Sale Expires At')}</Typography>
										<input
											type="date"
											className="description-input"
											min={minSaleDateInputValue()}
											max={maxSaleDateInputValue()}
											value={
												insertProductData.productSaleExpiresAt
													? new Date(insertProductData.productSaleExpiresAt).toISOString().slice(0, 10)
													: ''
											}
											onChange={({ target: { value } }) =>
												setInsertProductData({
													...insertProductData,
													productSaleExpiresAt: value === '' ? undefined : new Date(value),
												})
											}
										/>
										<div className="divider"></div>
									</Stack>
								</Stack>
							)}

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Condition')}</Typography>

									<select
										className="select-description"
										value={insertProductData.productCondition}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productCondition: value as ProductCondition,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(ProductCondition).map((condition) => (
											<option key={condition} value={condition}>
												{t(condition)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Material')}</Typography>

									<select
										className="select-description"
										value={insertProductData.productMaterial}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productMaterial: value as ProductMaterial,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(ProductMaterial).map((material) => (
											<option key={material} value={material}>
												{t(material)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Color')}</Typography>

									<select
										className="select-description"
										value={insertProductData.productColor}
										onChange={({ target: { value } }) =>
											setInsertProductData({
												...insertProductData,
												productColor: value as ProductColor,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{productColorList.map((color: ProductColor) => (
											<option key={color} value={color}>
												{t(color)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" alt="" loading="lazy" decoding="async" />
								</Stack>
							</Stack>

							<Typography className="furniture-title">{t('Product Description')}</Typography>
							<Stack className="config-column">
								<Typography className="title">{t('Description')}</Typography>
								<textarea
									name=""
									id=""
									className="description-text"
									value={insertProductData.productDesc}
									onChange={({ target: { value } }) =>
										setInsertProductData({ ...insertProductData, productDesc: value })
									}
								></textarea>
								{descTooShort && (insertProductData.productDesc || '') !== '' && (
									<span style={{ color: '#e03131', fontSize: 12 }}>{t('At least 5 characters')}</span>
								)}
							</Stack>
						</Stack>
						<Typography className="upload-title">{t('Upload photos of your product')}</Typography>
						<Stack className="images-box">
							<Stack className="upload-box">
								<div className="upload-icon">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
										<path
											d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<polyline
											points="14,2 14,8 20,8"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<line
											x1="16"
											y1="13"
											x2="8"
											y2="13"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<line
											x1="16"
											y1="17"
											x2="8"
											y2="17"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<polyline
											points="10,9 9,9 8,9"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>

								<Stack className="text-box">
									<Typography className="drag-title">{t('Upload Images')}</Typography>
									<Typography className="format-title">{t('JPEG or PNG • Min 2048x768')}</Typography>
								</Stack>

								<Button
									className="browse-button"
									onClick={() => {
										inputRef.current.click();
									}}
								>
									<Typography className="browse-button-text">{t('Choose Files')}</Typography>
									<input
										ref={inputRef}
										type="file"
										hidden={true}
										onChange={uploadImages}
										multiple={true}
										accept="image/jpg, image/jpeg, image/png"
									/>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
										<path
											d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<polyline
											points="7,10 12,15 17,10"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<line
											x1="12"
											y1="15"
											x2="12"
											y2="3"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</Button>
							</Stack>

							<Stack className="gallery-box">
								{insertProductData?.productImages?.map((image: string, idx: number) => {
									const imagePath: string = `${REACT_APP_API_URL}/${image}`;
									return (
										<Stack key={idx} className="image-box">
											<img src={imagePath} alt="" loading="lazy" decoding="async" />
											<div className="delete-btn">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
													<line
														x1="18"
														y1="6"
														x2="6"
														y2="18"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
													<line
														x1="6"
														y1="6"
														x2="18"
														y2="18"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</Stack>
									);
								})}
							</Stack>
						</Stack>

						<Stack className="config-column">
							<ArModelField
								imageUrl={
									insertProductData.productImages?.[0]
										? `${REACT_APP_API_URL}/${insertProductData.productImages[0]}`
										: undefined
								}
								value={insertProductData.productArModel}
								onChange={(productArModel) =>
									setInsertProductData({ ...insertProductData, productArModel })
								}
							/>
						</Stack>

						<Stack className="buttons-row">
							<Button
								className="next-button"
								disabled={doDisabledCheck()}
								onClick={router.query.productId ? updateProductHandler : insertProductHandler}
							>
								<Typography className="next-button-text">{t('Save')}</Typography>
							</Button>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

AddProduct.defaultProps = {
	initialValues: {
		productTitle: '',
		productPrice: 0,
		productType: '',
		productCategory: '',
		productMaterial: '',
		productColor: '',
		productSize: '',
		productSalePrice: 0,
		productIsOnSale: false,
		productInStock: false,
		productBarter: false,
		productRent: false,
		productCondition: '',
		productBrand: '',
		productOriginCountry: '',
		productDesc: '',
		productImages: [],
		productArModel: '',
	},
};

export default AddProduct;
