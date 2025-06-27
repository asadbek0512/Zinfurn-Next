// pages/_app.tsx

import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const shadows: ThemeOptions['shadows'] = [
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
	'none',
];

const light: ThemeOptions = {
	palette: {
		mode: 'light',
		background: {
			default: '#f5f5f5',
			paper: '#fff',
		},
		primary: {
			main: '#1976d2',
			contrastText: '#fff',
		},
		secondary: {
			main: '#9c27b0',
		},
		text: {
			primary: '#000',
			secondary: '#666',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiSelect: {
			styleOverrides: {
				select: ({ theme }) => ({
					textAlign: 'center',
				}),
			},
		},
	},
	shadows,
};

const App = ({ Component, pageProps }: AppProps) => {
	const [theme] = useState(() => createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const handleLoad = () => {
			setIsLoaded(true);
		};

		if (document.readyState === 'complete') {
			handleLoad();
		} else {
			window.addEventListener('load', handleLoad);
			return () => window.removeEventListener('load', handleLoad);
		}
	}, []);

	if (!isLoaded) {
		return (
			<>
				<div className="page-loader">
					<div className="loader-content">
						<img src="/img/banner/001..png" alt="Logo" className="logo" />
						<div className="dots">
							<span>.</span>
							<span>.</span>
							<span>.</span>
							<span>.</span>
						</div>
					</div>
				</div>

				<style jsx>{`
					.page-loader {
						position: fixed;
						top: 0;
						left: 0;
						z-index: 9999;
						width: 100%;
						height: 100vh;
						background-color: #fff;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.loader-content {
						display: flex;
						flex-direction: row;
						align-items: center;
						gap: 12px;
					}

					.logo {
						width: 100px;
						height: auto;
					}

					.dots {
						display: flex;
						gap: 5px;
					}

					.dots span {
						font-size: 36px;
						font-weight: bold;
						color: #333;
						animation: blink 1.4s infinite;
					}

					.dots span:nth-child(2) {
						animation-delay: 0.2s;
					}

					.dots span:nth-child(3) {
						animation-delay: 0.4s;
					}

					.dots span:nth-child(4) {
						animation-delay: 0.6s;
					}

					@keyframes blink {
						0%,
						80%,
						100% {
							opacity: 0;
						}
						40% {
							opacity: 1;
						}
					}
				`}</style>
			</>
		);
	}

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
