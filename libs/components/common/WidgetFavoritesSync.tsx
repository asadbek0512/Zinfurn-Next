import { useEffect } from 'react';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_FAVORITE_IDS } from '../../../apollo/user/query';
import { isWidgetBridgeAvailable, setWidgetFavorites } from '../../native/widget';

/** Backend idList limiti bilan bir xil */
const WIDGET_FAVORITES_LIMIT = 50;

/** Sevimlilarni app ochilganda va fonga o'tganda widget'ga uzatadi (logout'da tozalaydi) */
const WidgetFavoritesSync = () => {
	const client = useApolloClient();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		if (!isWidgetBridgeAvailable()) return;
		if (!user?._id) {
			setWidgetFavorites([]);
			return;
		}

		const sync = async () => {
			try {
				const { data } = await client.query({
					query: GET_FAVORITE_IDS,
					variables: { input: { page: 1, limit: WIDGET_FAVORITES_LIMIT } },
					fetchPolicy: 'network-only',
				});
				const list: { _id: string }[] = data?.getFavorites?.list ?? [];
				await setWidgetFavorites(list.map((item) => item._id));
			} catch {
				// tarmoq yo'q — keyingi safar
			}
		};
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') sync();
		};

		sync();
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, [user?._id, client]);

	return null;
};

export default WidgetFavoritesSync;
