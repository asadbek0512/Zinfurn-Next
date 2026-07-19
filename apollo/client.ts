import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken, getRefreshToken, setJwtToken, updateUserInfo } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';
import decodeJWT from 'jwt-decode';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

/** Access token muddati tugagan (yoki 30s ichida tugaydigan) bo'lsa false qaytaradi */
function isAccessTokenStillValid(): boolean {
	const token = getJwtToken();
	if (!token) return true; // token yo'q — anonim so'rov, refresh shart emas
	try {
		const { exp } = decodeJWT<{ exp?: number }>(token);
		if (!exp) return true; // eski (muddatsiz) legacy token — o'z holicha ishlayveradi
		return Date.now() < exp * 1000 - 30_000;
	} catch {
		return true;
	}
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: async () => {
		// Refresh token bo'lmasa yangilab bo'lmaydi — so'rov o'z holicha ketadi
		if (!getRefreshToken()) return true;
		return isAccessTokenStillValid();
	},
	// Refresh mutation'ni to'g'ridan-to'g'ri fetch bilan chaqiramiz (Apollo link zanjiridan tashqarida)
	fetchAccessToken: async () => {
		const refreshToken = getRefreshToken();
		const res = await fetch(process.env.REACT_APP_API_GRAPHQL_URL as string, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				query: `mutation RefreshToken($refreshToken: String!) {
					refreshToken(refreshToken: $refreshToken) { _id accessToken refreshToken }
				}`,
				variables: { refreshToken },
			}),
		});
		return res.json();
	},
	handleResponse: () => (response: any) => {
		const payload = response?.data?.refreshToken;
		if (!payload?.accessToken) throw new Error('Refresh failed');
		// Yangi refresh tokenni ham aylantiramiz (rotation)
		if (payload.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);
		return { accessToken: payload.accessToken };
	},
	handleFetch: (accessToken: string) => {
		setJwtToken(accessToken);
		localStorage.setItem('accessToken', accessToken);
		updateUserInfo(accessToken);
	},
	handleError: (err) => {
		// Refresh ham eskirgan — sessiya tugadi, tokenlarni tozalaymiz (sahifani majburan yo'naltirmaymiz)
		console.warn('Token refresh failed:', err);
		setJwtToken('');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	},
});

// Custom WebSocket client
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket)

		this.socket.onopen = () => {
		};

		this.socket.onmessage = (msg) => {
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	public send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
			credentials: 'include',
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			uri: process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3009',
			options: {
				reconnect: false,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},
			webSocketImpl: LoggingWebSocket
		});

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					const isAuthError = message.includes('Token') || message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('not provided');
					if (!message.includes('input') && !isAuthError) sweetErrorAlert(message);
				});
			}
			if (networkError) console.error(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
		connectToDevTools: process.env.NODE_ENV !== 'production',
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
