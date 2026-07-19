import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const device = useDeviceDetect();
	const imageInputRef = useRef<HTMLInputElement>(null);
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';

		return { articleTitle, articleContent, articleImage };
	}, []);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			memoizedValues.articleImage = responseImage; // bu articilemizni imageni qayerdaligini saqlab qoyayapmiz

			return `${REACT_APP_API_URL}/${responseImage}`; // Bu rasmimizni backendga saqlab kelayapti
		} catch (err) {
			console.error('Error, uploadImage:', err);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		memoizedValues.articleTitle = e.target.value;
	};

	const handleImagePickerChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const url = await uploadImage(file);
			if (url) {
				const editor = editorRef.current?.getInstance();
				editor?.insertText(`\n![image](${url})\n`);
				setUploadedImages((prev) => [...prev, url]);
			}
		} catch (err) {
			console.error('Image upload error:', err);
		}
		e.target.value = '';
	}, []);

	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (memoizedValues.articleContent === '' && memoizedValues.articleTitle === '') {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createboardArticle({
				variables: {
					input: { ...memoizedValues, articleCategory },
				},
			});

			await sweetTopSuccessAlert('Article is created successfully', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.error(err);
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		}
	};

	const doDisabledCheck = () => {
		if (memoizedValues.articleContent === '' || memoizedValues.articleTitle === '') {
			return true;
		}
	};

	if (device === 'mobile') {
		return (
			<div className="mob-teditor">
				<div className="mob-teditor-field">
					<label className="mob-teditor-label">Category</label>
					<FormControl fullWidth size="small" sx={{ background: 'var(--surface)', borderRadius: '10px' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							sx={{ borderRadius: '10px', fontSize: 14 }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>Free</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div className="mob-teditor-field">
					<label className="mob-teditor-label">Title</label>
					<TextField
						onChange={articleTitleHandler}
						placeholder="Enter article title"
						fullWidth
						size="small"
						sx={{
							background: 'var(--surface)',
							borderRadius: '10px',
							'& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 14 },
						}}
					/>
				</div>

				<div className="mob-teditor-field">
					<label className="mob-teditor-label">Content</label>
					<div className="mob-teditor-editor">
						<Editor
							initialValue={'Type here'}
							placeholder={'Type here'}
							previewStyle={'tab'}
							height={'320px'}
							// @ts-ignore
							initialEditType={'WYSIWYG'}
							toolbarItems={[
								['heading', 'bold', 'italic', 'strike'],
								['ul', 'ol'],
							]}
							ref={editorRef}
							hooks={{
								addImageBlobHook: async (image: any, callback: any) => {
									const uploadedImageURL = await uploadImage(image);
									callback(uploadedImageURL);
									return false;
								},
							}}
							events={{ load: function (param: any) {} }}
						/>
					</div>
				</div>

				{/* Image picker */}
				<input
					ref={imageInputRef}
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={handleImagePickerChange}
				/>
				<button className="mob-teditor-img-btn" onClick={() => imageInputRef.current?.click()}>
					<span className="mob-teditor-img-icon">🖼</span>
					<span>Add Image</span>
				</button>

				{uploadedImages.length > 0 && (
					<div className="mob-teditor-previews">
						{uploadedImages.map((url, i) => (
							<img key={i} src={url} alt="" className="mob-teditor-preview-img" />
						))}
					</div>
				)}

				<button className="mob-teditor-submit" onClick={handleRegisterButton}>
					Publish Article
				</button>
			</div>
		);
	}

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: 'var(--text-3)', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: 'var(--text-3)', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						onChange={articleTitleHandler}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={'Type here'}
				placeholder={'Type here'}
				previewStyle={'vertical'}
				height={'640px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleRegisterButton}
				>
					Register
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
