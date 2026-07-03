import { useEffect, useState } from 'react';
import { Dialog, IconButton, Stack } from '@mui/material';
import { Close, Telegram, WhatsApp, Facebook, ContentCopy, Check, Link as LinkIcon, IosShare } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

const COPIED_RESET_MS = 2000;

interface ShareNetwork {
	key: 'telegram' | 'whatsapp' | 'facebook' | 'twitter';
	label: string;
	color: string;
	bg: string;
	icon: React.ReactNode;
	href: (url: string, text: string) => string;
}

const NETWORKS: ShareNetwork[] = [
	{
		key: 'telegram',
		label: 'Telegram',
		color: '#fff',
		bg: '#229ED9',
		icon: <Telegram sx={{ fontSize: 26 }} />,
		href: (url, text) => `https://t.me/share/url?url=${url}&text=${text}`,
	},
	{
		key: 'whatsapp',
		label: 'WhatsApp',
		color: '#fff',
		bg: '#25D366',
		icon: <WhatsApp sx={{ fontSize: 26 }} />,
		href: (url, text) => `https://wa.me/?text=${text}%20${url}`,
	},
	{
		key: 'facebook',
		label: 'Facebook',
		color: '#fff',
		bg: '#1877F2',
		icon: <Facebook sx={{ fontSize: 26 }} />,
		href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
	},
	{
		key: 'twitter',
		label: 'X',
		color: '#fff',
		bg: '#000',
		icon: <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>𝕏</span>,
		href: (url, text) => `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
	},
];

interface ShareModalProps {
	open: boolean;
	onClose: () => void;
	url: string;
	title: string;
	text: string;
}

const ShareModal = ({ open, onClose, url, title, text }: ShareModalProps) => {
	const { t } = useTranslation('common');
	const [copied, setCopied] = useState(false);
	const [hasNativeShare, setHasNativeShare] = useState(false);

	useEffect(() => {
		setHasNativeShare(typeof navigator !== 'undefined' && !!(navigator as any).share);
	}, []);

	useEffect(() => {
		if (!copied) return;
		const id = setTimeout(() => setCopied(false), COPIED_RESET_MS);
		return () => clearTimeout(id);
	}, [copied]);

	const openNetwork = (network: ShareNetwork) => {
		const link = network.href(encodeURIComponent(url), encodeURIComponent(text));
		window.open(link, '_blank', 'noopener,noreferrer,width=600,height=500');
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
		} catch {
			/* clipboard unavailable */
		}
	};

	const handleNativeShare = async () => {
		try {
			await (navigator as any).share({ title, text, url });
			onClose();
		} catch {
			/* user cancelled */
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: 420,
					maxWidth: '92vw',
					borderRadius: '20px',
					p: '24px 22px 26px',
					overflow: 'visible',
				},
			}}
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" mb="20px">
				<span style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-1)' }}>{t('Share this product')}</span>
				<IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-3)' }}>
					<Close fontSize="small" />
				</IconButton>
			</Stack>

			<Stack direction="row" justifyContent="space-between" flexWrap="wrap" rowGap="18px" mb="22px">
				{NETWORKS.map((network) => (
					<Stack key={network.key} alignItems="center" spacing="8px" sx={{ width: hasNativeShare ? '20%' : '25%' }}>
						<IconButton
							onClick={() => openNetwork(network)}
							sx={{
								width: 54,
								height: 54,
								bgcolor: network.bg,
								color: network.color,
								transition: 'transform .15s ease, box-shadow .15s ease',
								'&:hover': { bgcolor: network.bg, transform: 'translateY(-2px)', boxShadow: '0 6px 14px rgba(0,0,0,.18)' },
							}}
						>
							{network.icon}
						</IconButton>
						<span style={{ fontSize: 12, color: 'var(--text-2)' }}>{network.label}</span>
					</Stack>
				))}

				{hasNativeShare && (
					<Stack alignItems="center" spacing="8px" sx={{ width: '20%' }}>
						<IconButton
							onClick={handleNativeShare}
							sx={{
								width: 54,
								height: 54,
								bgcolor: 'var(--primary)',
								color: '#fff',
								transition: 'transform .15s ease, box-shadow .15s ease',
								'&:hover': { bgcolor: 'var(--primary)', transform: 'translateY(-2px)', boxShadow: '0 6px 14px rgba(0,0,0,.18)' },
							}}
						>
							<IosShare sx={{ fontSize: 24 }} />
						</IconButton>
						<span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t('More')}</span>
					</Stack>
				)}
			</Stack>

			<Stack
				direction="row"
				alignItems="center"
				sx={{ border: '1px solid var(--border-soft)', borderRadius: '12px', p: '6px 6px 6px 14px', bgcolor: 'var(--surface-2)' }}
			>
				<LinkIcon sx={{ fontSize: 18, color: 'var(--text-4)', mr: '8px', flexShrink: 0 }} />
				<span
					style={{
						flex: 1,
						fontSize: 13,
						color: 'var(--text-2)',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{url}
				</span>
				<button
					type="button"
					onClick={handleCopy}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 6,
						border: 'none',
						cursor: 'pointer',
						borderRadius: '9px',
						padding: '9px 16px',
						fontSize: 13,
						fontWeight: 600,
						color: '#fff',
						background: copied ? '#2e9e5b' : 'var(--primary)',
						transition: 'background .2s ease',
						flexShrink: 0,
					}}
				>
					{copied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 15 }} />}
					{copied ? t('Copied') : t('Copy')}
				</button>
			</Stack>
		</Dialog>
	);
};

export default ShareModal;
