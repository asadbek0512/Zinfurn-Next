import React, { useMemo } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import { useTranslation } from 'next-i18next';

interface CommunityCardProps {
  vertical: boolean;
  article: BoardArticle;
  index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
  const { t, i18n } = useTranslation('common');
  const { vertical, article, index } = props;
  const device = useDeviceDetect();

  const articleImage = article?.articleImage
    ? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
    : '/img/event.svg';

  const formatDate = (date: string | Date, locale: string) => {
    const months: { [key: string]: string[] } = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      kr: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
     };

    if (!date) return 'No date';

    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const monthIndex = d.getMonth();
    const lang = (locale?.split('-')[0] || 'en').toLowerCase();
    const currentLocale = lang in months ? lang : 'en';
    const month = months[currentLocale][monthIndex];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const formattedDate = useMemo(() => {
    return formatDate(article?.createdAt, i18n.language);
  }, [article?.createdAt, i18n.language]);

  if (device === 'mobile') {
    return <div>{t('COMMUNITY CARD MOBILE')}</div>;
  }

  if (vertical) {
    return (
      <Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
        <Box component={'div'} className={'vertical-card'}>
          <div className={'community-img'} style={{ backgroundImage: `url(${articleImage})` }}>
            <div className={'date-badge'}>
              <span style={{ color: 'white', fontSize: '14px' }}>{formattedDate}</span>
            </div>
          </div>
          <div className={'card-content'}>
            <strong>{article?.articleTitle}</strong>
            <span>{t('Lorem ipsum dolor sit amet, consectetur adipiscing elit')}</span>
            <div className={'read-more'}>{t('Read More')}</div>
          </div>
        </Box>
      </Link>
    );
  } else {
    return (
      <Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
        <Box component={'div'} className="horizontal-card">
          <img src={articleImage} alt={article?.articleTitle} />
          <div className={'card-info'}>
            <strong>{article.articleTitle}</strong>
            <span>{t('Lorem ipsum dolor sit amet, consectetur adipiscing elit')}</span>
            <div className={'read-more'}>{t('Read More')}</div>
          </div>
        </Box>
      </Link>
    );
  }
};

export default CommunityCard;
