import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import SendIcon from '@mui/icons-material/Send';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT } from '../../../apollo/user/mutation';
import { Comment } from '../../types/comment/comment';
import { CommentGroup } from '../../enums/comment.enum';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface QASectionProps {
	propertyId: string;
	ownerId?: string;
}

const FETCH_LIMIT = 100;
const MAX_LENGTH = 1000;

const QASection = ({ propertyId, ownerId }: QASectionProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [question, setQuestion] = useState<string>('');
	const [answerText, setAnswerText] = useState<Record<string, string>>({});
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [createComment] = useMutation(CREATE_COMMENT);

	const isOwner = !!user?._id && user._id === ownerId;

	const { data, loading, refetch } = useQuery(GET_COMMENTS, {
		variables: {
			input: {
				page: 1,
				limit: FETCH_LIMIT,
				sort: 'createdAt',
				direction: 'DESC',
				search: { commentRefId: propertyId, commentGroup: CommentGroup.PROPERTY_QA },
			},
		},
		skip: !propertyId,
		fetchPolicy: 'cache-and-network',
		// bo'sh bo'lsa backend NO_DATA_FOUND tashlaydi — xatoni yutib yuboramiz
		onError: () => {},
	});

	const all: Comment[] = data?.getComments?.list || [];
	const questions = useMemo(() => all.filter((c) => !c.commentReplyId), [all]);
	const answersByParent = useMemo(() => {
		const map: Record<string, Comment[]> = {};
		all.filter((c) => c.commentReplyId).forEach((a) => {
			const key = String(a.commentReplyId);
			if (!map[key]) map[key] = [];
			map[key].push(a);
		});
		return map;
	}, [all]);

	const avatarOf = (c?: Comment) =>
		c?.memberData?.memberImage
			? c.memberData.memberImage.startsWith('http')
				? c.memberData.memberImage
				: `${REACT_APP_API_URL}/${c.memberData.memberImage}`
			: '/img/profile/defaultUser.svg';

	const submit = async (content: string, replyId?: string) => {
		if (!user?._id) {
			await sweetMixinErrorAlert(t('Please login first'));
			return;
		}
		const trimmed = content.trim();
		if (!trimmed) return;
		setSubmitting(true);
		try {
			await createComment({
				variables: {
					input: {
						commentGroup: CommentGroup.PROPERTY_QA,
						commentContent: trimmed,
						commentRefId: propertyId,
						...(replyId ? { commentReplyId: replyId } : {}),
					},
				},
			});
			if (replyId) setAnswerText((p) => ({ ...p, [replyId]: '' }));
			else setQuestion('');
			await refetch();
		} catch (err) {
			await sweetMixinErrorAlert((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	const formatDate = (d: Date) =>
		new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

	return (
		<div className="qa-section">
			<div className="qa-header">
				<Typography className="qa-title">
					{t('Questions & Answers')}
					{questions.length > 0 && <span className="qa-total-badge">{questions.length}</span>}
				</Typography>
			</div>

			{/* Ask form */}
			{!isOwner && (
				<div className="qa-ask">
					<textarea
						className="qa-ask-input"
						placeholder={t('Ask a question about this product...')}
						value={question}
						maxLength={MAX_LENGTH}
						onChange={(e) => setQuestion(e.target.value)}
					/>
					<button className="qa-ask-btn" disabled={submitting || !question.trim()} onClick={() => submit(question)}>
						<SendIcon sx={{ fontSize: 15 }} /> {t('Ask')}
					</button>
				</div>
			)}

			{/* List */}
			{loading && questions.length === 0 ? (
				<div className="qa-loading">{t('Loading...')}</div>
			) : questions.length === 0 ? (
				<div className="qa-empty">
					<QuestionAnswerOutlinedIcon sx={{ fontSize: 40, color: 'var(--bg-strong)' }} />
					<Typography className="qa-empty-title">{t('No questions yet')}</Typography>
					<Typography className="qa-empty-sub">{t('Be the first to ask about this product!')}</Typography>
				</div>
			) : (
				<div className="qa-list">
					{questions.map((q) => {
						const answers = answersByParent[String(q._id)] || [];
						return (
							<div className="qa-item" key={q._id}>
								<div className="qa-q">
									<span className="qa-badge-q">Q</span>
									<div className="qa-q-body">
										<p className="qa-q-text">{q.commentContent}</p>
										<div className="qa-q-meta">
											<img className="qa-avatar" src={avatarOf(q)} alt="" loading="lazy" decoding="async" />
											<span className="qa-name">{q.memberData?.memberNick || t('User')}</span>
											<span className="qa-date">{formatDate(q.createdAt)}</span>
										</div>
									</div>
								</div>

								{answers.map((a) => (
									<div className="qa-a" key={a._id}>
										<span className="qa-badge-a">A</span>
										<div className="qa-a-body">
											<p className="qa-a-text">{a.commentContent}</p>
											<div className="qa-q-meta">
												<img className="qa-avatar" src={avatarOf(a)} alt="" loading="lazy" decoding="async" />
												<span className="qa-name">{a.memberData?.memberNick || t('Seller')}</span>
												<span className="qa-seller-tag">{t('Seller')}</span>
												<span className="qa-date">{formatDate(a.createdAt)}</span>
											</div>
										</div>
									</div>
								))}

								{isOwner && (
									<div className="qa-answer-form">
										<textarea
											className="qa-answer-input"
											placeholder={t('Write an answer...')}
											value={answerText[String(q._id)] || ''}
											maxLength={MAX_LENGTH}
											onChange={(e) => setAnswerText((p) => ({ ...p, [String(q._id)]: e.target.value }))}
										/>
										<button
											className="qa-answer-btn"
											disabled={submitting || !(answerText[String(q._id)] || '').trim()}
											onClick={() => submit(answerText[String(q._id)] || '', String(q._id))}
										>
											{t('Answer')}
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default QASection;
