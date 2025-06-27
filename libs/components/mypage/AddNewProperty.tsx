import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	PropertyCategory,
	PropertyColor,
	PropertyCondition,
	PropertyMaterial,
	PropertyType,
} from '../../enums/property.enum';
import { REACT_APP_API_URL, propertyColorList } from '../../config';
import { PropertyInput } from '../../types/property/property.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_PROPERTY, UPDATE_PROPERTY } from '../../../apollo/user/mutation';
import { GET_PROPERTY } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';

const AddProperty = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertPropertyData, setInsertPropertyData] = useState<PropertyInput>(initialValues);
	const [propertyType, setPropertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [propertyLocation, setPropertyLocation] = useState<PropertyCategory[]>(Object.values(PropertyCategory));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const [createProperty] = useMutation(CREATE_PROPERTY);
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getPropertyLoading,
		data: getPropertyData,
		error: getPropertyError,
		refetch: getPropertyRefetch,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				propertyId: router.query.propertyId,
			},
		},
		skip: !router.query.propertyId,
		onCompleted: (data) => {
			if (data?.getProperty) {
				setInsertPropertyData({
					propertyTitle: data.getProperty.propertyTitle,
					propertyPrice: data.getProperty.propertyPrice,
					propertyType: data.getProperty.propertyType,
					propertyCategory: data.getProperty.propertyCategory,
					propertyDesc: data.getProperty.propertyDesc,
					propertyMaterial: data.getProperty.propertyMaterial,
					propertyColor: data.getProperty.propertyColor,
					propertySize: data.getProperty.propertySize,
					propertySalePrice: data.getProperty.propertySalePrice,
					propertyIsOnSale: data.getProperty.propertyIsOnSale,
					propertySaleExpiresAt: data.getProperty.propertySaleExpiresAt,
					propertyInStock: data.getProperty.propertyInStock,
					propertyCondition: data.getProperty.propertyCondition,
					propertyImages: data.getProperty.propertyImages,
				});
			}
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.propertyId) {
			getPropertyRefetch();
		}
	}, [router.query.propertyId]);

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
						target: 'property',
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

			console.log('+responseImages: ', responseImages);
			setInsertPropertyData({ ...insertPropertyData, propertyImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}
	const doDisabledCheck = (): boolean => {
		if (
			insertPropertyData.propertyTitle === '' ||
			insertPropertyData.propertyPrice === 0 ||
			!insertPropertyData.propertyType ||
			!insertPropertyData.propertyCategory ||
			!insertPropertyData.propertyCondition ||
			!insertPropertyData.propertyMaterial ||
			!insertPropertyData.propertyColor ||
			insertPropertyData.propertyDesc === '' ||
			(insertPropertyData.propertyImages?.length ?? 0) === 0 // Optional chaining + nullish coalescing
		) {
			return true;
		}
		return false;
	};

	const insertPropertyHandler = useCallback(async () => {
		try {
			const result = await createProperty({
				variables: {
					input: insertPropertyData,
				},
			});
			await sweetMixinSuccessAlert('This property has been created successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProperties',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertPropertyData]);

	const updatePropertyHandler = useCallback(async () => {
		try {
			const updateData = {
				_id: getPropertyData?.getProperty?._id,
				propertyTitle: insertPropertyData.propertyTitle,
				propertyPrice: insertPropertyData.propertyPrice,
				propertyType: insertPropertyData.propertyType,
				propertyCategory: insertPropertyData.propertyCategory,
				propertyDesc: insertPropertyData.propertyDesc,
				propertyMaterial: insertPropertyData.propertyMaterial,
				propertyColor: insertPropertyData.propertyColor,
				propertySize: insertPropertyData.propertySize,
				propertySalePrice: insertPropertyData.propertySalePrice,
				propertyIsOnSale: insertPropertyData.propertyIsOnSale,
				propertySaleExpiresAt: insertPropertyData.propertySaleExpiresAt,
				propertyInStock: insertPropertyData.propertyInStock,
				propertyCondition: insertPropertyData.propertyCondition,
				propertyImages: insertPropertyData.propertyImages,
				propertyStatus: getPropertyData?.getProperty?.propertyStatus,
			};

			const result = await updateProperty({
				variables: {
					input: updateData,
				},
			});
			await sweetMixinSuccessAlert('This property has been updated successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myProperties',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertPropertyData, getPropertyData?.getProperty?._id, getPropertyData?.getProperty?.propertyStatus]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	console.log('+insertPropertyData', insertPropertyData);

	if (device === 'mobile') {
		return <div>ADD NEW PROPERTY MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-property-page">
				<Stack className="main-title-box">
					<Typography className="main-title">{t('Add New Property')}</Typography>
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
									value={insertPropertyData.propertyTitle}
									onChange={({ target: { value } }) =>
										setInsertPropertyData({ ...insertPropertyData, propertyTitle: value })
									}
								/>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Price')}</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={t('Price')}
										value={insertPropertyData.propertyPrice}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertyPrice: parseInt(value) })
										}
									/>
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Type')}</Typography>
									<select
										className="select-description"
										value={insertPropertyData.propertyType}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyType: value as PropertyType,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(PropertyType).map((type) => (
											<option value={type} key={type}>
												{t(type)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Category')}</Typography>

									<select
										className="select-description"
										value={insertPropertyData.propertyCategory}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyCategory: value as PropertyCategory,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(PropertyCategory).map((category) => (
											<option key={category} value={category}>
												{t(category)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Size')}</Typography>
									<input
										type="text"
										className="description-input"
										placeholder={t('Size (e.g. 120x80x75 cm)')}
										value={insertPropertyData.propertySize || ''}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({ ...insertPropertyData, propertySize: value })
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
											insertPropertyData.propertyIsOnSale === undefined
												? 'select'
												: insertPropertyData.propertyIsOnSale
												? 'yes'
												: 'no'
										}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyIsOnSale: value === 'yes',
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
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>
							</Stack>

							{insertPropertyData.propertyIsOnSale && (
								<Stack direction="row" spacing={2} className="config-row">
									<Stack className="price-year-after-price">
										<Typography className="title">{t('Sale Price')}</Typography>
										<input
											type="number"
											className="description-input"
											placeholder={t('Sale Price')}
											value={insertPropertyData.propertySalePrice ?? ''}
											onChange={({ target: { value } }) =>
												setInsertPropertyData({
													...insertPropertyData,
													propertySalePrice: value === '' ? undefined : Number(value),
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
											value={
												insertPropertyData.propertySaleExpiresAt
													? new Date(insertPropertyData.propertySaleExpiresAt).toISOString().slice(0, 10)
													: ''
											}
											onChange={({ target: { value } }) =>
												setInsertPropertyData({
													...insertPropertyData,
													propertySaleExpiresAt: value === '' ? undefined : new Date(value),
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
										value={insertPropertyData.propertyCondition}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyCondition: value as PropertyCondition,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(PropertyCondition).map((condition) => (
											<option key={condition} value={condition}>
												{t(condition)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Material')}</Typography>

									<select
										className="select-description"
										value={insertPropertyData.propertyMaterial}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyMaterial: value as PropertyMaterial,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{Object.values(PropertyMaterial).map((material) => (
											<option key={material} value={material}>
												{t(material)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>

								<Stack className="price-year-after-price">
									<Typography className="title">{t('Color')}</Typography>

									<select
										className="select-description"
										value={insertPropertyData.propertyColor}
										onChange={({ target: { value } }) =>
											setInsertPropertyData({
												...insertPropertyData,
												propertyColor: value as PropertyColor,
											})
										}
									>
										<option disabled value="">
											{t('Select')}
										</option>

										{propertyColorList.map((color: PropertyColor) => (
											<option key={color} value={color}>
												{t(color)}
											</option>
										))}
									</select>

									<div className="divider"></div>
									<img src="/img/icons/Vector.svg" className="arrow-down" />
								</Stack>
							</Stack>

							<Typography className="property-title">{t('Property Description')}</Typography>
							<Stack className="config-column">
								<Typography className="title">{t('Description')}</Typography>
								<textarea
									name=""
									id=""
									className="description-text"
									value={insertPropertyData.propertyDesc}
									onChange={({ target: { value } }) =>
										setInsertPropertyData({ ...insertPropertyData, propertyDesc: value })
									}
								></textarea>
							</Stack>
						</Stack>
						<Typography className="upload-title">{t('Upload photos of your property')}</Typography>
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
								{insertPropertyData?.propertyImages?.map((image: string, idx: number) => {
									const imagePath: string = `${REACT_APP_API_URL}/${image}`;
									return (
										<Stack key={idx} className="image-box">
											<img src={imagePath} alt="" />
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
						<Stack className="buttons-row">
							<Button
								className="next-button"
								disabled={doDisabledCheck()}
								onClick={router.query.propertyId ? updatePropertyHandler : insertPropertyHandler}
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

AddProperty.defaultProps = {
	initialValues: {
		propertyTitle: '',
		propertyPrice: 0,
		propertyType: '',
		propertyCategory: '',
		propertyMaterial: '',
		propertyColor: '',
		propertySize: '',
		propertySalePrice: 0,
		propertyIsOnSale: false,
		propertyInStock: false,
		propertyBarter: false,
		propertyRent: false,
		propertyCondition: '',
		propertyBrand: '',
		propertyOriginCountry: '',
		propertyDesc: '',
		propertyImages: [],
	},
};

export default AddProperty;
