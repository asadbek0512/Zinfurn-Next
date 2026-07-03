import React, { SyntheticEvent, useState } from 'react';
import { Box, Stack, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import CircularProgress from '@mui/material/CircularProgress';
import Loading from '../common/Loading';
import { useTranslation } from 'next-i18next';
import { getLocalizedNoticeTitle, getLocalizedNoticeContent } from '../../utils/localizeNotice';

const Faq = () => {
	const { t, i18n } = useTranslation('common');
	const device = useDeviceDetect();
	const [expanded, setExpanded] = useState<string | false>('panel1');

	const { data: faqData, loading } = useQuery(GET_ALL_NOTICES, {
		variables: {
			input: {
				noticeCategory: NoticeCategory.FAQ,
				noticeStatus: NoticeStatus.ACTIVE,
			},
		},
	});

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	if (device === 'mobile') {
		if (loading) return <Loading />;
		return (
			<div className="mob-cs-faq">
				{faqData?.getAllNotices?.list?.slice()?.reverse()?.map((faq: any, index: number) => (
					<Accordion
						key={faq._id}
						expanded={expanded === `panel${index + 1}`}
						onChange={handleChange(`panel${index + 1}`)}
						className="mob-cs-faq-item"
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--primary)' }} />} className="mob-cs-faq-summary">
							<HelpOutlineIcon sx={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0, mr: 1 }} />
							<span className="mob-cs-faq-question">{getLocalizedNoticeTitle(faq, i18n.language)}</span>
						</AccordionSummary>
						<AccordionDetails className="mob-cs-faq-answer">
							<p>{getLocalizedNoticeContent(faq, i18n.language)}</p>
						</AccordionDetails>
					</Accordion>
				))}
			</div>
		);
	}

	if (loading) {
		return <Loading />;
	}

	return (
		<Stack className={'faq-content'}>
			<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
				<Typography variant="h4" component="h1" className={'title'} sx={{ mb: 0 }}>
					{t('Frequently Asked Questions')}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
					{t('Find answers to common questions about our services')}
				</Typography>
			</Box>

			<Box component="div" className={'wrap'}>
				{faqData?.getAllNotices?.list
					?.slice()
					?.reverse()
					?.map((faq: any, index: number) => (
						<Accordion
							key={faq._id}
							expanded={expanded === `panel${index + 1}`}
							onChange={handleChange(`panel${index + 1}`)}
							sx={{
								'&.MuiAccordion-root': {
									borderRadius: '12px',
									mb: 2,
									overflow: 'hidden',
									border: '1px solid var(--border-soft)',
									'&:before': {
										display: 'none',
									},
									'&.Mui-expanded': {
										margin: '8px 0',
									},
								},
							}}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								sx={{
									backgroundColor: 'var(--surface)',
									'&:hover': {
										backgroundColor: 'var(--surface-2)',
									},
									'&.Mui-expanded': {
										backgroundColor: 'var(--surface-2)',
									},
								}}
							>
								<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
									<HelpOutlineIcon sx={{ color: ' #ff6b35' }} />
									<Typography sx={{ color: 'var(--text-1)', fontWeight: 500 }}>{getLocalizedNoticeTitle(faq, i18n.language)}</Typography>
								</Box>
							</AccordionSummary>
							<AccordionDetails
								sx={{
									backgroundColor: 'var(--surface)',
									borderTop: '1px solid var(--border-soft)',
									p: 3,
								}}
							>
								<Typography sx={{ color: 'var(--text-2)', lineHeight: 1.6 }}>{getLocalizedNoticeContent(faq, i18n.language)}</Typography>
							</AccordionDetails>
						</Accordion>
					))}
			</Box>
		</Stack>
	);
};

export default Faq;
