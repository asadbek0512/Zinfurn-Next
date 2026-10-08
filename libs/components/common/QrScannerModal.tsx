import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import jsQR from 'jsqr';
import { hapticTap } from '../../native';

interface QrScannerModalProps {
	open: boolean;
	onClose: () => void;
}

/** Faqat o'z saytimiz havolalari app ichida ochiladi — begona QR'dagi linkka o'tmaymiz */
const SITE_HOSTS = new Set(['zinfurn.uz', 'www.zinfurn.uz']);
/** Har kadrni emas, shu oraliqda tekshiramiz — telefon qizib ketmasin */
const SCAN_INTERVAL_MS = 250;
const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
	video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
	audio: false,
};

type ScanError = 'camera' | 'foreign' | null;

const toSitePath = (text: string): string | null => {
	try {
		const url = new URL(text);
		return url.protocol === 'https:' && SITE_HOSTS.has(url.hostname) ? url.pathname + url.search + url.hash : null;
	} catch {
		return null;
	}
};

/** Do'kondagi / reklamadagi Zinfurn QR kodini skanerlab mahsulot sahifasini ochadi */
const QrScannerModal = ({ open, onClose }: QrScannerModalProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [error, setError] = useState<ScanError>(null);

	useEffect(() => {
		if (!open) return;
		setError(null);
		let stream: MediaStream | null = null;
		let timer: ReturnType<typeof setInterval> | null = null;
		let stopped = false;
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d', { willReadFrequently: true });

		const scanFrame = () => {
			const video = videoRef.current;
			if (!video || !ctx || video.readyState < video.HAVE_ENOUGH_DATA) return;
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' });
			if (!code?.data) return;
			const path = toSitePath(code.data);
			if (!path) {
				setError('foreign');
				return;
			}
			hapticTap();
			onClose();
			router.push(path);
		};

		const start = async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
				if (stopped) return;
				const video = videoRef.current;
				if (!video) return;
				video.srcObject = stream;
				await video.play();
				timer = setInterval(scanFrame, SCAN_INTERVAL_MS);
			} catch {
				if (!stopped) setError('camera');
			}
		};
		start();

		return () => {
			stopped = true;
			if (timer) clearInterval(timer);
			stream?.getTracks().forEach((track) => track.stop());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	return (
		<Dialog open={open} onClose={onClose} fullScreen PaperProps={{ className: 'qr-scanner' }}>
			<video ref={videoRef} className="qr-scanner-video" playsInline muted />
			<div className="qr-scanner-frame" />
			<IconButton className="qr-scanner-close" onClick={onClose} aria-label={t('Close')}>
				<CloseIcon />
			</IconButton>
			<p className="qr-scanner-hint">
				{error === 'camera'
					? t('Camera access denied')
					: error === 'foreign'
						? t('Not a Zinfurn QR code')
						: t('Point the camera at a Zinfurn QR code')}
			</p>
		</Dialog>
	);
};

export default QrScannerModal;
