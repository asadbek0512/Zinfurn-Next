import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, CircularProgress, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import ScrollableFeed from 'react-scrollable-feed';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../hooks/useDeviceDetect';

interface AiProduct {
	_id: string;
	title: string;
	price: number;
	originalPrice?: number | null;
	image: string;
}

interface AiAction {
	label: string;
	href: string;
}

interface AiMessage {
	role: 'user' | 'assistant';
	content: string;
	products?: AiProduct[];
	actions?: AiAction[];
}

/** AI navigatsiya tugmalari — bosilганda tegishli sahifaga o'tadi */
const AiActionButtons = ({ actions, onGo }: { actions?: AiAction[]; onGo: (href: string) => void }) => {
	if (!actions || actions.length === 0) return null;
	return (
		<div className="ai-actions">
			{actions.map((a, i) => (
				<button key={i} className="ai-action-btn" onClick={() => onGo(a.href)}>
					{a.label} <span className="ai-action-arrow">→</span>
				</button>
			))}
		</div>
	);
};

/** AI tavsiya qilgan mahsulot kartalari — bosilганda detail sahifaga o'tadi */
const AiProductCards = ({ products, onPick }: { products?: AiProduct[]; onPick: (id: string) => void }) => {
	if (!products || products.length === 0) return null;
	return (
		<div className="ai-products">
			{products.map((p) => (
				<div key={p._id} className="ai-product-card" onClick={() => onPick(p._id)} role="button">
					{p.image ? <img src={p.image} alt={p.title} className="ai-product-img" loading="lazy" /> : <div className="ai-product-img" />}
					<div className="ai-product-info">
						<div className="ai-product-title">{p.title}</div>
						<div className="ai-product-price">
							<span className="ai-product-now">${Number(p.price).toLocaleString()}</span>
							{p.originalPrice ? <span className="ai-product-old">${Number(p.originalPrice).toLocaleString()}</span> : null}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const AiChat = () => {
	const [messages, setMessages] = useState<AiMessage[]>([]);
	const [input, setInput] = useState('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const mobFrameRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!router.isReady) return;
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, [router.isReady]);

	useEffect(() => {
		setOpenButton(false);
		if (!router.isReady) return;
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 800);
		return () => clearTimeout(timeoutId);
	}, [router.pathname, router.isReady]);

	const handleToggle = () => {
		setOpen((prev) => !prev);
	};

	const pickProduct = (id: string) => {
		setOpen(false);
		router.push({ pathname: '/property/detail', query: { id } });
	};

	const goTo = (href: string) => {
		setOpen(false);
		router.push(href);
	};

	useEffect(() => {
		const handler = () => setOpen((prev) => !prev);
		window.addEventListener('toggle-mob-ai', handler);
		return () => window.removeEventListener('toggle-mob-ai', handler);
	}, []);

	useEffect(() => {
		if (device !== 'mobile' || typeof window === 'undefined') return;
		const vv = window.visualViewport;
		if (!vv) return;
		const reposition = () => {
			const el = mobFrameRef.current;
			if (!el) return;
			const kbHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
			if (kbHeight > 50) {
				el.style.bottom = `${kbHeight + 12}px`;
				el.style.height = `${vv.height - 80}px`;
			} else {
				el.style.bottom = '';
				el.style.height = '';
			}
		};
		vv.addEventListener('resize', reposition);
		vv.addEventListener('scroll', reposition);
		return () => {
			vv.removeEventListener('resize', reposition);
			vv.removeEventListener('scroll', reposition);
		};
	}, [device]);

	const getInputHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	}, []);

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};

	const sendMessage = async () => {
		const text = input.trim();
		if (!text || loading) return;

		const userMessage: AiMessage = { role: 'user', content: text };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		setInput('');
		setLoading(true);

		try {
			const response = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: updatedMessages,
					locale: router.locale || 'en',
				}),
			});

			const data = await response.json();
			// Server xatosi (500/rate-limit) yoki bo'sh javob — bo'sh bubble o'rniga xato xabari
			if (!response.ok || !data?.reply) {
				setMessages((prev) => [...prev, { role: 'assistant', content: t('AI error message') }]);
				return;
			}
			const aiMessage: AiMessage = { role: 'assistant', content: data.reply, products: data.products, actions: data.actions };
			setMessages((prev) => [...prev, aiMessage]);
		} catch (err) {
			const errMessage: AiMessage = {
				role: 'assistant',
				content: t('AI error message'),
			};
			setMessages((prev) => [...prev, errMessage]);
		} finally {
			setLoading(false);
		}
	};

	const aiMessages = (
		<>
			<Box className="ai-chat-top" component="div">
				<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
				<span>{t('Zinfurn AI Assistant')}</span>
			</Box>
			<Box className="ai-chat-content" component="div">
				<ScrollableFeed>
					<Stack className="ai-chat-main">
						<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
							<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
								<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
							</Avatar>
							<div className="ai-msg-left">{t('AI Welcome Message')}</div>
						</Box>
						{messages.map((msg, idx) =>
							msg.role === 'user' ? (
								<Box key={idx} component="div" flexDirection="row" style={{ display: 'flex' }} alignItems="flex-end" justifyContent="flex-end" sx={{ m: '10px 0px' }}>
									<div className="ai-msg-right">{msg.content}</div>
								</Box>
							) : (
								<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
									</Avatar>
									<div className="ai-msg-left">{msg.content}<AiProductCards products={msg.products} onPick={pickProduct} /><AiActionButtons actions={msg.actions} onGo={goTo} /></div>
								</Box>
							),
						)}
						{loading && (
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
									<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
								</Avatar>
								<div className="ai-msg-left ai-typing"><span></span><span></span><span></span></div>
							</Box>
						)}
					</Stack>
				</ScrollableFeed>
			</Box>
			<Box className="ai-chat-bott" component="div">
				<input type="text" className="ai-msg-input" placeholder={t('AI Input Placeholder')} value={input} onChange={getInputHandler} onKeyDown={getKeyHandler} disabled={loading} />
				<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
					{loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <SendIcon style={{ color: '#fff' }} />}
				</button>
			</Box>
		</>
	);

	if (device === 'mobile') {
		return (
			<Stack className="ai-chatting mob-ai-chatting">
				{open && <div className="mob-chat-backdrop" onClick={handleToggle} />}
				<Stack className={`ai-chat-frame ${open ? 'open' : ''}`} ref={mobFrameRef as any}>
					<Box className="ai-chat-top" component="div">
						<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
						<span>{t('Zinfurn AI Assistant')}</span>
						<button onClick={handleToggle} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
							<CloseIcon style={{ fontSize: 20, color: 'var(--text-2)' }} />
						</button>
					</Box>
					<Box className="ai-chat-content" component="div">
						<ScrollableFeed>
							<Stack className="ai-chat-main">
								<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
									</Avatar>
									<div className="ai-msg-left">{t('AI Welcome Message')}</div>
								</Box>
								{messages.map((msg, idx) =>
									msg.role === 'user' ? (
										<Box key={idx} component="div" flexDirection="row" style={{ display: 'flex' }} alignItems="flex-end" justifyContent="flex-end" sx={{ m: '10px 0px' }}>
											<div className="ai-msg-right">{msg.content}</div>
										</Box>
									) : (
										<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
											<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
												<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
											</Avatar>
											<div className="ai-msg-left">{msg.content}<AiProductCards products={msg.products} onPick={pickProduct} /><AiActionButtons actions={msg.actions} onGo={goTo} /></div>
										</Box>
									),
								)}
								{loading && (
									<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
											<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
										</Avatar>
										<div className="ai-msg-left ai-typing"><span></span><span></span><span></span></div>
									</Box>
								)}
							</Stack>
						</ScrollableFeed>
					</Box>
					<Box className="ai-chat-bott" component="div">
						<input type="text" className="ai-msg-input" placeholder={t('AI Input Placeholder')} value={input} onChange={getInputHandler} onKeyDown={getKeyHandler} disabled={loading} />
						<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
							{loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <SendIcon style={{ color: '#fff' }} />}
						</button>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="ai-chatting">
			<style>{`
				@keyframes ai-float {
					0%   { transform: translateY(0px); }
					50%  { transform: translateY(-8px); }
					100% { transform: translateY(0px); }
				}
				@keyframes ai-pulse-ring {
					0%   { box-shadow: 0 0 0 0 rgba(207, 100, 34, 0.4); }
					70%  { box-shadow: 0 0 0 14px rgba(207, 100, 34, 0); }
					100% { box-shadow: 0 0 0 0 rgba(207, 100, 34, 0); }
				}
				.ai-btn-open {
					animation: ai-float 2.5s ease-in-out infinite, ai-pulse-ring 2.5s ease-in-out infinite;
				}
				.ai-btn-open:hover {
					animation: ai-float 2.5s ease-in-out infinite, ai-pulse-ring 2.5s ease-in-out infinite;
					filter: drop-shadow(0 0 12px rgba(255, 200, 80, 0.85)) 
							drop-shadow(0 0 24px rgba(255, 160, 40, 0.5));
					transition: filter 0.4s ease;
				}
			`}</style>

			{openButton ? (
				<>
					{/* Ochish buttoni — faqat chat yopiq bo'lganda */}
					{!open && (
						<button
							className="ai-chat-button ai-btn-open"
							onClick={handleToggle}
							style={{
								bottom: '320px',
								background: 'transparent',
								boxShadow: 'none',
								zIndex: 99999,
							}}
						>
							<img src="/img/ai1.webp" alt="AI" style={{ width: 54, height: 74 }} />
						</button>
					)}

					{/* Yopish buttoni — faqat chat ochiq bo'lganda, pastda alohida */}
					{open && (
						<button
							onClick={handleToggle}
							style={{
								position: 'fixed',
								bottom: '100px', // 👈 pastda turadi
								right: '30px',
								width: '50px',
								height: '50px',
								borderRadius: '50%',
								background: 'var(--primary)',
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: '0px 0px 10px 0px rgba(50,50,50,0.3)',
								zIndex: 99999, // 👈 hamma narsa ustida
							}}
						>
							<CloseFullscreenIcon style={{ color: '#fff' }} />
						</button>
					)}
				</>
			) : null}

			<Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
				<Box className="ai-chat-top" component="div">
					<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32, marginRight: '8px' }} />
					<span>{t('Zinfurn AI Assistant')}</span>
				</Box>
				<Box className="ai-chat-content" component="div">
					<ScrollableFeed>
						<Stack className="ai-chat-main">
							<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
								<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
									<img src="/img/ai1.webp" alt="AI" style={{ width: 32, height: 32 }} />
								</Avatar>
								<div className="ai-msg-left">{t('AI Welcome Message')}</div>
							</Box>
							{messages.map((msg, idx) =>
								msg.role === 'user' ? (
									<Box
										key={idx}
										component="div"
										flexDirection="row"
										style={{ display: 'flex' }}
										alignItems="flex-end"
										justifyContent="flex-end"
										sx={{ m: '10px 0px' }}
									>
										<div className="ai-msg-right">{msg.content}</div>
									</Box>
								) : (
									<Box key={idx} flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
										<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
											<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
										</Avatar>
										<div className="ai-msg-left">{msg.content}<AiProductCards products={msg.products} onPick={pickProduct} /><AiActionButtons actions={msg.actions} onGo={goTo} /></div>
									</Box>
								),
							)}
							{loading && (
								<Box flexDirection="row" style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component="div">
									<Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42, flexShrink: 0 }}>
										<img src="/img/ai1.webp" alt="AI" style={{ width: 30, height: 30 }} />
									</Avatar>
									<div className="ai-msg-left ai-typing">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className="ai-chat-bott" component="div">
					<input
						type="text"
						className="ai-msg-input"
						placeholder={t('AI Input Placeholder')}
						value={input}
						onChange={getInputHandler}
						onKeyDown={getKeyHandler}
						disabled={loading}
					/>
					<button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
						{loading ? (
							<CircularProgress size={18} style={{ color: '#fff' }} />
						) : (
							<SendIcon style={{ color: '#fff' }} />
						)}
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default AiChat;
