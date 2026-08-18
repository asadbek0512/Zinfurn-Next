import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ANALYZE_ROOM, GENERATE_ROOM_IMAGE } from '../../../apollo/user/mutation';
import { GeneratedRoomImage, RoomAnalysisResult } from '../../types/aiRoom/aiRoom';
import { getLocalizedTitle } from '../../utils/localizeProperty';
import { sweetErrorHandling } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const readFileAsBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			const [, base64] = result.split(',');
			resolve({ base64, mimeType: file.type });
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

const AiRoomDesigner = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const device = useDeviceDetect();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [imageBase64, setImageBase64] = useState<string | null>(null);
	const [mimeType, setMimeType] = useState<string | null>(null);
	const [userRequest, setUserRequest] = useState('');
	const [result, setResult] = useState<RoomAnalysisResult | null>(null);
	const [generatedImage, setGeneratedImage] = useState<GeneratedRoomImage | null>(null);
	const [generatingId, setGeneratingId] = useState<string | null>(null);

	const [analyzeRoom, { loading }] = useMutation(ANALYZE_ROOM);
	const [generateRoomImage] = useMutation(GENERATE_ROOM_IMAGE);

	const handlePickImage = () => fileInputRef.current?.click();

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const { base64, mimeType } = await readFileAsBase64(file);
		setImageBase64(base64);
		setMimeType(mimeType);
		setPreviewUrl(URL.createObjectURL(file));
		setResult(null);
	};

	const handleAnalyze = async () => {
		if (!imageBase64) return;
		try {
			const { data } = await analyzeRoom({
				variables: {
					input: {
						imageBase64,
						mimeType: mimeType || undefined,
						userRequest: userRequest.trim() || undefined,
					},
				},
			});
			setResult(data?.analyzeRoom ?? null);
			setGeneratedImage(null);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const handleViewProduct = (id: string) => {
		router.push({ pathname: '/property/detail', query: { id } });
	};

	const handleGenerateImage = async (productId: string) => {
		if (!imageBase64) return;
		setGeneratingId(productId);
		try {
			const { data } = await generateRoomImage({
				variables: {
					input: {
						roomImageBase64: imageBase64,
						mimeType: mimeType || undefined,
						productId,
					},
				},
			});
			setGeneratedImage(data?.generateRoomImage ?? null);
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setGeneratingId(null);
		}
	};

	return (
		<Box component="section" className="ai-room-designer">
			<Stack spacing={1.5} className="intro" alignItems="center">
				<Box className="intro-badge">
					<AutoAwesomeIcon className="sparkle" />
				</Box>
				<Typography variant={device === 'mobile' ? 'h5' : 'h3'} component="h1">
					{t('AI bilan xonangizga mos mebel toping')}
				</Typography>
				<Typography variant="body1" className="intro-subtext">
					{t('Xonangiz rasmini yuklang, xohlasangiz nima izlayotganingizni yozing — AI mos mahsulotlarni tavsiya qiladi')}
				</Typography>
			</Stack>

			<Card className="upload-card">
				<CardContent>
					<input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

					{previewUrl ? (
						<Box component="div" className="preview-wrapper" onClick={handlePickImage}>
							<img src={previewUrl} alt="room preview" className="preview-image" />
						</Box>
					) : (
						<Box component="div" className="upload-placeholder" onClick={handlePickImage}>
							<CloudUploadIcon className="upload-icon" />
							<Typography>{t('Xona rasmini yuklash uchun bosing')}</Typography>
						</Box>
					)}

					<TextField
						fullWidth
						className="request-input"
						placeholder={t("Masalan: shu xonaga mos krovat qo'yib ber")}
						value={userRequest}
						onChange={(e) => setUserRequest(e.target.value)}
					/>

					<Button
						variant="contained"
						className="analyze-button"
						disabled={!imageBase64 || loading}
						onClick={handleAnalyze}
					>
						{loading ? <CircularProgress size={22} color="inherit" /> : t('Tahlil qilish')}
					</Button>
				</CardContent>
			</Card>

			{result && (
				<Stack spacing={2} className="result">
					<Typography variant="h6">{result.styleNotes}</Typography>
					<Stack direction="row" spacing={1} flexWrap="wrap">
						{result.dominantColors?.map((c) => (
							<Chip key={c} label={c} size="small" />
						))}
						{result.suggestedMaterial && <Chip label={result.suggestedMaterial} size="small" color="primary" />}
					</Stack>

					<Box component="div" className="matched-grid">
						{result.matchedProducts.map((property) => (
							<Card key={property._id} className="matched-card">
								<Box
									component="div"
									className="matched-image"
									onClick={() => handleViewProduct(property._id)}
									sx={{ backgroundImage: `url(${process.env.REACT_APP_API_URL}/${property.propertyImages?.[0]})` }}
								/>
								<CardContent>
									<Typography className="matched-title" onClick={() => handleViewProduct(property._id)}>
										{getLocalizedTitle(property, router.locale)}
									</Typography>
									<Typography className="matched-price">${property.propertySalePrice || property.propertyPrice}</Typography>
									<Button
										size="small"
										variant="outlined"
										className="generate-button"
										disabled={generatingId === property._id}
										onClick={() => handleGenerateImage(property._id)}
									>
										{generatingId === property._id ? (
											<CircularProgress size={16} color="inherit" />
										) : (
											t('Xonaga joylashtirish')
										)}
									</Button>
								</CardContent>
							</Card>
						))}
						{result.matchedProducts.length === 0 && (
							<Typography className="no-match">{t("Mos mahsulot topilmadi, boshqa rasm bilan urinib ko'ring")}</Typography>
						)}
					</Box>

					{generatedImage && (
						<Box component="div" className="generated-result">
							<Typography variant="h6">{t('Natija')}</Typography>
							<img
								src={`data:${generatedImage.mimeType};base64,${generatedImage.imageBase64}`}
								alt="generated room"
								className="generated-image"
							/>
						</Box>
					)}
				</Stack>
			)}
		</Box>
	);
};

export default AiRoomDesigner;
