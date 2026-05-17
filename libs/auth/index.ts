import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

const TOKEN_KEY = 'accessToken';
let _inMemoryToken = '';

export function getJwtToken(): string {
	if (_inMemoryToken) return _inMemoryToken;
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(TOKEN_KEY);
		if (stored) {
			try {
				const { exp } = decodeJWT<{ exp: number }>(stored);
				if (exp * 1000 > Date.now()) {
					_inMemoryToken = stored;
					return stored;
				}
				localStorage.removeItem(TOKEN_KEY);
			} catch {
				localStorage.removeItem(TOKEN_KEY);
			}
		}
	}
	return '';
}

export function setJwtToken(token: string) {
	_inMemoryToken = token;
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });
		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	const isEmail = nick.includes('@');
	const input = {
		memberPassword: password,
		...(isEmail ? { memberEmail: nick } : { memberNick: nick }),
	};
	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input },
			fetchPolicy: 'network-only',
		});
		const { accessToken } = result?.data?.login;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
		}
		throw new Error('token error');
	}
};

export const signUp = async (
	nick: string,
	password: string,
	phone: string,
	email: string,
	type: string,
): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, email, type });
		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('signup err', err);
		logOut();
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	email,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	email: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: {
					memberNick: nick,
					memberPassword: password,
					memberPhone: phone,
					memberEmail: email,
					memberType: type,
				},
			},
			fetchPolicy: 'network-only',
		});
		console.log('---------- signup ----------');
		const { accessToken } = result?.data?.signup;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request signup token err', err.graphQLErrors);
		switch (err.graphQLErrors[0]?.message) {
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again');
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!');
				break;
			case 'Definer: email already exists':
				await sweetMixinErrorAlert('This email is already registered');
				break;
			case 'Definer: nick already exists':
				await sweetMixinErrorAlert('This nickname is already taken');
				break;
			default:
				await sweetMixinErrorAlert('Registration failed. Please try again.');
		}
		throw new Error('signup token error');
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	if (typeof window !== 'undefined') {
		localStorage.setItem(TOKEN_KEY, jwtToken);
	}
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;
	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProperties: claims.memberProperties,
		memberRank: claims.memberRank,
		memberEmail: claims.memberEmail,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberFollowers: claims.memberFollowers,
		memberFollowings: claims.memberFollowings,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
		memberTelegramId: '',
		memberGoogleId: '',
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).finally(() => {
		window.location.href = '/';
	});
};

const deleteStorage = () => {
	_inMemoryToken = '';
	if (typeof window !== 'undefined') {
		localStorage.removeItem(TOKEN_KEY);
	}
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberEmail: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberFollowers: 0,
		memberFollowings: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
		memberTelegramId: '',
		memberGoogleId: '',
	});
};
