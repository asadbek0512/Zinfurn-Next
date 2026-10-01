import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REGISTER_PUSH_TOKEN } from '../../../apollo/user/mutation';
import { isPushEnabled, pushPlatform, setupPush } from '../../native/push';

/** Login bo'lgan app foydalanuvchisi uchun push'ni yoqadi; bildirishnoma bosilsa sahifasini ochadi */
const PushSetup = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [registerPushToken] = useMutation(REGISTER_PUSH_TOKEN);

	useEffect(() => {
		if (!user?._id || !isPushEnabled()) return;
		let cleanup: (() => void) | undefined;
		let cancelled = false;

		(async () => {
			const remove = await setupPush(
				(pushToken) => {
					registerPushToken({ variables: { input: { pushToken, pushPlatform: pushPlatform() } } }).catch((err) =>
						console.error('push token save failed', err),
					);
				},
				(url) => router.push(url),
			);
			if (cancelled) remove();
			else cleanup = remove;
		})().catch((err) => console.error('push setup failed', err));

		return () => {
			cancelled = true;
			cleanup?.();
		};
	}, [user?._id]);

	return null;
};

export default PushSetup;
