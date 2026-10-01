import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { userVar } from '../../../apollo/store';
import { BLOCK_MEMBER, REPORT_CONTENT } from '../../../apollo/user/mutation';
import { ReportGroup, ReportReason } from '../../enums/report.enum';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert, sweetSelectAlert } from '../../sweetAlert';

interface ModerationMenuProps {
	group: ReportGroup;
	refId?: string;
	authorId?: string;
	/** Bloklangandan keyin ro'yxatni yangilash uchun */
	onBlocked?: () => void;
	className?: string;
}

/** App Store 1.2 (UGC): har bir foydalanuvchi kontentida "Shikoyat" va "Bloklash" bo'lishi shart */
const ModerationMenu = ({ group, refId, authorId, onBlocked, className }: ModerationMenuProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [reportContent] = useMutation(REPORT_CONTENT);
	const [blockMember] = useMutation(BLOCK_MEMBER);

	// Mehmon yoki o'z kontenti uchun menyu ko'rsatilmaydi
	if (!user?._id || !refId || (authorId && authorId === user._id)) return null;

	const close = () => setAnchor(null);

	const reportHandler = async () => {
		close();
		const reasons = Object.fromEntries(Object.values(ReportReason).map((r) => [r, String(t(`Report reason ${r}`))]));
		const reason = await sweetSelectAlert(t('Report title'), reasons, t('Report submit'), t('Cancel'));
		if (!reason) return;
		try {
			await reportContent({ variables: { input: { reportGroup: group, reportReason: reason, reportRefId: refId } } });
			await sweetMixinSuccessAlert(t('Report sent'));
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const blockHandler = async () => {
		close();
		if (!authorId || !(await sweetConfirmAlert(t('Block confirm')))) return;
		try {
			await blockMember({ variables: { memberId: authorId } });
			await sweetMixinSuccessAlert(t('Block done'));
			onBlocked?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			<IconButton
				size="small"
				className={className}
				aria-label={t('Report title')}
				onClick={(e) => {
					e.stopPropagation();
					setAnchor(e.currentTarget);
				}}
			>
				<MoreVertIcon fontSize="small" />
			</IconButton>
			<Menu anchorEl={anchor} open={!!anchor} onClose={close} disableScrollLock>
				<MenuItem onClick={reportHandler}>
					<ListItemIcon>
						<FlagOutlinedIcon fontSize="small" />
					</ListItemIcon>
					{t('Report')}
				</MenuItem>
				{authorId && (
					<MenuItem onClick={blockHandler} sx={{ color: 'var(--danger)' }}>
						<ListItemIcon sx={{ color: 'inherit' }}>
							<BlockOutlinedIcon fontSize="small" />
						</ListItemIcon>
						{t('Block user')}
					</MenuItem>
				)}
			</Menu>
		</>
	);
};

export default ModerationMenu;
