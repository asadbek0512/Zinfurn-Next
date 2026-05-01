import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { CartItem } from '../libs/types/cart/cart';

export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberEmail: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProperties: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberFollowers: 0,
	memberFollowings: 0,
	memberWarnings: 0,
	memberBlocks: 0,
	memberTelegramId: '',
	memberGoogleId: '',
});

// @ts-ignore
export const socketVar = makeVar<WebSocket>();

// Cart: always start empty — CartDrawer loads from localStorage on mount (client only)
export const cartVar = makeVar<CartItem[]>([]);
export const cartDrawerVar = makeVar<boolean>(false);
