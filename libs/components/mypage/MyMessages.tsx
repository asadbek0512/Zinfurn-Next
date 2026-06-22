import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Stack, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';
import { GET_MY_CONVERSATIONS, GET_CONVERSATION } from '../../../apollo/user/query';
import { REPLY_MESSAGE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { sweetErrorHandling } from '../../sweetAlert';

dayjs.extend(relativeTime);

const img = (path?: string, fallback = '/img/profile/defaultUser.svg') =>
	path ? (path.startsWith('http') ? path : `${REACT_APP_API_URL}/${path}`) : fallback;

const MyMessages = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [text, setText] = useState('');
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const { data: convData, loading: convLoading, refetch: refetchConvs } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'cache-and-network',
		pollInterval: 15000,
	});
	const conversations = convData?.getMyConversations ?? [];

	const { data: msgData, refetch: refetchMsgs } = useQuery(GET_CONVERSATION, {
		variables: { conversationId: activeId },
		skip: !activeId,
		fetchPolicy: 'cache-and-network',
		pollInterval: activeId ? 6000 : 0,
	});
	const messages = msgData?.getConversation ?? [];

	const [replyMessage] = useMutation(REPLY_MESSAGE);

	const activeConv = conversations.find((c: any) => c.conversationId === activeId);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages.length, activeId]);

	const openConversation = async (id: string) => {
		setActiveId(id);
		// marking-as-read happens server-side on fetch; refresh badge counts
		setTimeout(() => refetchConvs(), 500);
	};

	const sendReply = async () => {
		if (!text.trim() || !activeId) return;
		const value = text;
		setText('');
		try {
			await replyMessage({ variables: { input: { conversationId: activeId, message: value } } });
			await refetchMsgs();
			await refetchConvs();
		} catch (err) {
			setText(value);
			await sweetErrorHandling(err);
		}
	};

	return (
		<div id="my-messages-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('Messages')}</Typography>
					<Typography className="sub-title">{t('Chat with buyers and sellers')}</Typography>
				</Stack>
			</Stack>

			<div className="mm-layout">
				{/* Conversations list */}
				<div className={`mm-list ${activeId ? 'mm-hidden-mobile' : ''}`}>
					{convLoading && conversations.length === 0 && <div className="mm-empty">{t('Loading...')}</div>}
					{!convLoading && conversations.length === 0 && (
						<div className="mm-empty">
							<ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#ddd' }} />
							<p>{t('No messages yet')}</p>
						</div>
					)}
					{conversations.map((c: any) => (
						<div
							key={c.conversationId}
							className={`mm-conv ${activeId === c.conversationId ? 'active' : ''}`}
							onClick={() => openConversation(c.conversationId)}
						>
							<img className="mm-conv-avatar" src={img(c.partner?.memberImage)} alt="" />
							<div className="mm-conv-info">
								<span className="mm-conv-name">{c.partner?.memberNick || t('User')}</span>
								<span className="mm-conv-last">{c.lastMessage}</span>
								<span className="mm-conv-prop">{c.kind === 'REPAIR' ? `🔧 ${t('Repair Request')}` : c.propertyTitle}</span>
							</div>
							<div className="mm-conv-meta">
								<span className="mm-conv-time">{dayjs(c.lastMessageAt).fromNow()}</span>
								{c.unreadCount > 0 && <span className="mm-conv-badge">{c.unreadCount}</span>}
							</div>
						</div>
					))}
				</div>

				{/* Thread */}
				<div className={`mm-thread ${activeId ? '' : 'mm-hidden-mobile'}`}>
					{!activeId ? (
						<div className="mm-thread-placeholder">
							<ChatBubbleOutlineIcon sx={{ fontSize: 48, color: '#ddd' }} />
							<p>{t('Select a conversation')}</p>
						</div>
					) : (
						<>
							<div className="mm-thread-head">
								<button className="mm-back" onClick={() => setActiveId(null)}>
									<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
								</button>
								<img className="mm-thread-avatar" src={img(activeConv?.partner?.memberImage)} alt="" />
								<div className="mm-thread-head-info">
									<span className="mm-thread-name">{activeConv?.partner?.memberNick || t('User')}</span>
									<span className="mm-thread-prop">{activeConv?.kind === 'REPAIR' ? `🔧 ${t('Repair Request')}` : activeConv?.propertyTitle}</span>
								</div>
							</div>

							<div className="mm-messages">
								{messages.map((m: any) => {
									const mine = String(m.senderId) === String(user?._id);
									return (
										<div key={m._id} className={`mm-bubble-row ${mine ? 'mine' : 'theirs'}`}>
											{!mine && <img className="mm-bubble-avatar" src={img(m.senderData?.memberImage)} alt="" />}
											<div className="mm-bubble">
												<span className="mm-bubble-text">{m.message}</span>
												<span className="mm-bubble-time">{dayjs(m.createdAt).format('HH:mm')}</span>
											</div>
										</div>
									);
								})}
								<div ref={bottomRef} />
							</div>

							<div className="mm-composer">
								<input
									className="mm-input"
									placeholder={t('Type a message...')}
									value={text}
									onChange={(e) => setText(e.target.value)}
									onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
								/>
								<button className="mm-send" onClick={sendReply} disabled={!text.trim()}>
									<SendIcon sx={{ fontSize: 18 }} />
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default MyMessages;
