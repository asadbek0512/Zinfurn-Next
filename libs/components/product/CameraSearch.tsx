import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { CircularProgress, Dialog, IconButton } from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useCurrency } from '../../context/CurrencyContext';
import { hapticTap } from '../../native';
import type { ImageSearchResponse } from '../../../pages/api/image-search';

/** AI'ga yuboriladigan rasmning eng katta tomoni — kichikroq = tezroq, aniqlik yetarli */
const MAX_IMAGE_SIDE = 1024;
const JPEG_QUALITY = 0.8;
const ALL_RESULTS_LIMIT = 9;

const resizeToBase64 = (file: File): Promise<{ data: string; preview: string }> =>
	new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
			const canvas = document.createElement('canvas');
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			const preview = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
			resolve({ data: preview.split(',')[1], preview });
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('image load failed'));
		};
		img.src = url;
	});

type Props = { className?: string };

/** Qidiruv maydonidagi kamera tugmasi: rasm → AI → katalogdan o'xshash mebellar */
const CameraSearch = ({ className }: Props) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { formatPrice } = useCurrency();
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState('');
	const [result, setResult] = useState<ImageSearchResponse | null>(null);
	const [failed, setFailed] = useState(false);

	const onFile = async (file: File | undefined) => {
		if (!file) return;
		setOpen(true);
		setLoading(true);
		setResult(null);
		setFailed(false);
		try {
			const { data, preview: img } = await resizeToBase64(file);
			setPreview(img);
			const res = await fetch('/api/image-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image: data, mimeType: 'image/jpeg', locale: router.locale }),
			});
			const json = (await res.json()) as ImageSearchResponse;
			if (!res.ok) throw new Error(json.error);
			setResult(json);
		} catch (err) {
			console.error('camera search failed', err);
			setFailed(true);
		} finally {
			setLoading(false);
			if (inputRef.current) inputRef.current.value = '';
		}
	};

	const showAll = () => {
		if (!result?.type) return;
		const input = { page: 1, limit: ALL_RESULTS_LIMIT, sort: 'createdAt', direction: 'DESC', search: { typeList: [result.type] } };
		setOpen(false);
		router.push(`/products?input=${JSON.stringify(input)}`, `/products?input=${JSON.stringify(input)}`, { scroll: false });
	};

	return (
		<>
			<IconButton
				className={`camera-search-btn ${className ?? ''}`}
				aria-label={String(t('Camera search'))}
				onClick={() => {
					hapticTap();
					inputRef.current?.click();
				}}
				size="small"
			>
				<PhotoCameraOutlinedIcon fontSize="small" />
			</IconButton>
			<input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />

			<Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" className="camera-search-dialog">
				<div className="cs-head">
					<span>{String(t('Camera search'))}</span>
					<IconButton size="small" onClick={() => setOpen(false)} aria-label="close">
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>
				<div className="cs-body">
					{preview && <img className="cs-preview" src={preview} alt="" />}
					{loading && (
						<div className="cs-state">
							<CircularProgress size={28} />
							<span>{String(t('Camera search loading'))}</span>
						</div>
					)}
					{failed && <div className="cs-state">{String(t('Camera search failed'))}</div>}
					{result && !loading && (
						<>
							{result.description && <p className="cs-desc">{result.description}</p>}
							{result.products.length === 0 ? (
								<div className="cs-state">{String(t('Camera search empty'))}</div>
							) : (
								<div className="cs-grid">
									{result.products.map((p) => (
										<Link key={p._id} href={`/products/detail?id=${p._id}`} className="cs-item" onClick={() => setOpen(false)}>
											<img src={p.image} alt={p.title} loading="lazy" />
											<span className="cs-title">{p.title}</span>
											<span className="cs-price">{formatPrice(p.price)}</span>
										</Link>
									))}
								</div>
							)}
							{result.type && (
								<button type="button" className="cs-all" onClick={showAll}>
									{String(t('Camera search all'))}
								</button>
							)}
						</>
					)}
				</div>
			</Dialog>
		</>
	);
};

export default CameraSearch;
