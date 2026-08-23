import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Stack, TextField, Typography, LinearProgress } from '@mui/material';
import { getJwtToken } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

/**
 * Attaches a real-world-scaled GLB to a property, either generated from its photo
 * or uploaded by hand. Both paths go through the same normalisation and the same
 * validated `modelUploader` mutation.
 */

interface ArModelFieldProps {
	/** Absolute URL of the product photo the model is generated from */
	imageUrl?: string;
	value?: string;
	onChange: (modelUrl: string) => void;
}

const POLL_INTERVAL_MS = 5000;
const DEFAULT_WIDTH_CM = 80;
const MIN_WIDTH_CM = 5;
const MAX_WIDTH_CM = 500;
const TERMINAL_FAILURE_STATES = ['FAILED', 'EXPIRED', 'CANCELED'];

const ArModelField = ({ imageUrl, value, onChange }: ArModelFieldProps) => {
	const fileRef = useRef<HTMLInputElement | null>(null);
	const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [widthCm, setWidthCm] = useState(DEFAULT_WIDTH_CM);
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState('');
	const [progress, setProgress] = useState(0);

	useEffect(() => () => {
		if (pollRef.current) clearTimeout(pollRef.current);
	}, []);

	const uploadGlb = async (bytes: Uint8Array): Promise<string> => {
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ModelUploader($file: Upload!, $target: String!) {
					modelUploader(file: $file, target: $target)
				}`,
				variables: { file: null, target: 'property' },
			}),
		);
		formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
		formData.append('0', new File([bytes], 'model.glb', { type: 'model/gltf-binary' }));

		const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${getJwtToken()}`,
			},
		});

		const uploaded = response.data?.data?.modelUploader;
		if (!uploaded) throw new Error(response.data?.errors?.[0]?.message ?? 'Model yuklanmadi');
		return uploaded;
	};

	const waitForModel = (taskId: string): Promise<string> =>
		new Promise((resolve, reject) => {
			const poll = async () => {
				try {
					const { data } = await axios.get(`/api/ar-generate?taskId=${encodeURIComponent(taskId)}`);
					setProgress(data.progress ?? 0);
					setStatus(`3D yaratilmoqda… ${data.progress ?? 0}%`);

					if (data.modelUrl) return resolve(data.modelUrl);
					if (TERMINAL_FAILURE_STATES.includes(data.status)) {
						return reject(new Error(`Generatsiya muvaffaqiyatsiz: ${data.status}`));
					}
					pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
				} catch (error: any) {
					reject(new Error(error?.response?.data?.error ?? error.message));
				}
			};
			poll();
		});

	const handleGenerate = async () => {
		if (!imageUrl) {
			await sweetMixinErrorAlert('Avval mahsulot rasmini yuklang');
			return;
		}
		setBusy(true);
		setProgress(0);
		try {
			setStatus('So‘rov yuborilmoqda…');
			const { data } = await axios.post('/api/ar-generate', { imageUrl });

			const generatedUrl = await waitForModel(data.taskId);

			setStatus('Model o‘lchamga keltirilmoqda…');
			const imported = await axios.post(
				'/api/ar-import',
				{ modelUrl: generatedUrl, realWidthCm: widthCm },
				{ responseType: 'arraybuffer' },
			);

			setStatus('Yuklanmoqda…');
			onChange(await uploadGlb(new Uint8Array(imported.data)));
			setStatus('Tayyor');
		} catch (error: any) {
			setStatus('');
			await sweetMixinErrorAlert(error?.response?.data?.error ?? error.message);
		} finally {
			setBusy(false);
		}
	};

	const handleManualUpload = async () => {
		const file = fileRef.current?.files?.[0];
		if (!file) return;

		setBusy(true);
		try {
			setStatus('Model o‘lchamga keltirilmoqda…');
			// gltf-transform pulls in node:fs, so normalisation runs server-side
			const normalized = await axios.post(`/api/ar-normalize?realWidthCm=${widthCm}`, await file.arrayBuffer(), {
				headers: { 'Content-Type': 'application/octet-stream' },
				responseType: 'arraybuffer',
			});

			setStatus('Yuklanmoqda…');
			onChange(await uploadGlb(new Uint8Array(normalized.data)));
			setStatus('Tayyor');
		} catch (error: any) {
			setStatus('');
			await sweetMixinErrorAlert(error.message);
		} finally {
			setBusy(false);
			if (fileRef.current) fileRef.current.value = '';
		}
	};

	return (
		<div className="ar-model-field">
			<Typography className="config-column-title">3D model (AR)</Typography>

			<TextField
				type="number"
				size="small"
				label="Haqiqiy eni (sm)"
				value={widthCm}
				disabled={busy}
				inputProps={{ min: MIN_WIDTH_CM, max: MAX_WIDTH_CM }}
				onChange={(event) => setWidthCm(Number(event.target.value))}
				helperText="AR da mebel shu o‘lchamda ko‘rinadi"
			/>

			<Stack direction="row" spacing={1}>
				<Button variant="contained" disabled={busy || !imageUrl} onClick={handleGenerate}>
					Rasmdan 3D yaratish
				</Button>
				<Button variant="outlined" disabled={busy} onClick={() => fileRef.current?.click()}>
					GLB yuklash
				</Button>
			</Stack>

			<input ref={fileRef} type="file" accept=".glb,model/gltf-binary" hidden onChange={handleManualUpload} />

			{busy && <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} />}
			{status && <Typography variant="caption">{status}</Typography>}

			{value && (
				<div className="ar-model-attached">
					<Typography variant="caption">Biriktirilgan: {value.split('/').pop()}</Typography>
				</div>
			)}
		</div>
	);
};

export default ArModelField;
