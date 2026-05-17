import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import { useRouter } from 'next/router';
import { setJwtToken, updateUserInfo, getJwtToken } from '../libs/auth';
import CartDrawer from '../libs/components/cart/CartDrawer';
import { CurrencyProvider } from '../libs/context/CurrencyContext';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();

	useEffect(() => {
		const storedToken = getJwtToken();
		if (storedToken) updateUserInfo(storedToken);
	}, []);

	useEffect(() => {
		const { token } = router.query;
		if (token && typeof token === 'string') {
			setJwtToken(token);
			updateUserInfo(token);
			router.replace('/');
		}
	}, [router.query]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<CurrencyProvider>
					<Component {...pageProps} />
					<CartDrawer />
				</CurrencyProvider>
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
