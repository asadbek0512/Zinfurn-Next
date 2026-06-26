import React from 'react';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Comment } from '../../types/comment/comment';
import { REACT_APP_API_URL } from '../../config';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';

interface ReviewProps {
	comment: Comment;
}

const Review = (props: ReviewProps) => {
	const { comment } = props;
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [value, setValue] = React.useState<number | null>(2);
	const imagePath: string = comment?.memberData?.memberImage
		? (comment?.memberData?.memberImage?.startsWith('http') ? comment?.memberData?.memberImage : `${REACT_APP_API_URL}/${comment?.memberData?.memberImage}`)
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/
	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};
	if (device === 'mobile') {
		return (
			<Stack className="mob-review-config">
				<Stack className="mob-review-header">
					<img loading="lazy" decoding="async" src={imagePath} alt="" className="mob-review-avatar" />
					<Stack className="mob-review-user-info">
						<Typography className="mob-review-name" onClick={() => goMemberPage(comment?.memberData?._id as string)}>
							{comment.memberData?.memberNick}
						</Typography>
						<Typography className="mob-review-type">
							{t(comment.memberData?.memberType ?? '')}
						</Typography>
					</Stack>
				</Stack>
				<Typography className="mob-review-text">{comment.commentContent}</Typography>
			</Stack>
		);
	} else {
		return (
			<Stack className={'review-config'}>
				<Stack className={'review-mb-info'}>
					<Stack className={'img-name-box'}>
						<img loading="lazy" decoding="async" src={imagePath} alt="" className={'img-box'} />
						<Stack>
							<Typography className={'name'} onClick={() => goMemberPage(comment?.memberData?._id as string)}>
								{comment.memberData?.memberNick}
							</Typography>
							<Typography className={'member-type'}>
								{t(comment.memberData?.memberType ?? '')}
							</Typography>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'desc-box'}>
					<Typography className={'description'}>{comment.commentContent}</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default Review;
