import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({
		nick: '',
		password: '',
		phone: '',
		type: 'USER',
		memberEmail: '',
	});
	const [loginView, setLoginView] = useState<boolean>(true);
	const [rememberMe, setRememberMe] = useState<boolean>(true);
	const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const checkUserTypeHandler = (e: any) => {
		const value = e.target.name;
		handleInput('type', value);
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			const newInput = { ...prev, [name]: value };
			return newInput;
		});
	}, []);

	const doLogin = useCallback(async () => {
		console.warn(input);
		if (!input.memberEmail || !input.password) {
			await sweetMixinErrorAlert('Email and password are required');
			return;
		}

		try {
			const result = await logIn(input.memberEmail, input.password);
			window.location.href = router.query.referrer?.toString() ?? '/';
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Login failed');
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			await signUp(input.nick, input.password, input.phone, input.memberEmail, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);
	(Join as any).hideTop = true;
	const handleGoogleAuth = () => {
		// Google authentication logic
	};

	console.log('+input: ', input);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						<Stack className={'left'}>
							{/* Title */}
							<Box component="div" className={'info'}>
								<span>{loginView ? 'Sign In' : 'Sign Up'}</span>
								<p>
									{loginView
										? 'Please fill your detail to access your account.'
										: 'Fill your information below or register with your social account.'}
								</p>
							</Box>

							{/* Input Fields */}
							<Box component="div" className={'input-wrap'}>
								{/* SIGNUP FIELDS */}
								{!loginView && (
									<>
										{/* NICKNAME */}
										<div className={'input-box'}>
											<span>Nickname</span>
											<input
												type="text"
												placeholder="Enter your nickname"
												value={input.nick}
												onChange={(e) => handleInput('nick', e.target.value)}
												required={true}
											/>
										</div>

										{/* EMAIL */}
										<div className={'input-box'}>
											<span>Email Address</span>
											<input
												type="email"
												placeholder="Enter your email address"
												value={input.memberEmail}
												onChange={(e) => handleInput('memberEmail', e.target.value)}
												required={true}
											/>
										</div>
									</>
								)}

								{/* LOGIN FIELDS */}
								{loginView && (
									<div className={'input-box'}>
										<span>Email or Nickname</span>
										<input
											type="text"
											placeholder="Enter email or nickname"
											value={input.memberEmail}
											onChange={(e) => handleInput('memberEmail', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key === 'Enter') {
													doLogin();
												}
											}}
										/>
									</div>
								)}

								{/* PASSWORD - ikkala uchun ham */}
								<div className={'input-box'} style={{ position: 'relative' }}>
									<span>Password</span>
									<input
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter your password"
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										required={true}
										onKeyDown={(event) => {
											if (event.key === 'Enter' && loginView) doLogin();
											if (event.key === 'Enter' && !loginView) doSignUp();
										}}
									/>
									<Box
										component="div"
										sx={{
											position: 'absolute',
											right: 12,
											top: 35,
											cursor: 'pointer',
											color: '#666',
											fontSize: '18px',
											userSelect: 'none',
										}}
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
												<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
												<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
												<line x1="2" y1="2" x2="22" y2="22" />
											</svg>
										) : (
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
												<circle cx="12" cy="12" r="3" />
											</svg>
										)}
									</Box>
								</div>

								{/* PHONE - faqat signup uchun */}
								{!loginView && (
									<div className={'input-box'}>
										<span>Phone Number</span>
										<input
											type="tel"
											placeholder="Enter your phone number"
											value={input.phone}
											onChange={(e) => handleInput('phone', e.target.value)}
											required={true}
											onKeyDown={(event) => {
												if (event.key === 'Enter') doSignUp();
											}}
										/>
									</div>
								)}
							</Box>

							<Box component="div" className={'register'}>
								{/* User Type - faqat signup uchun */}
								{!loginView && (
									<div className={'type-option'}>
										<span className={'text'}>I want to be registered as:</span>
										<div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'USER'}
															onChange={checkUserTypeHandler}
															checked={input?.type === 'USER'}
														/>
													}
													label="USER"
												/>
											</FormGroup>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'AGENT'}
															onChange={checkUserTypeHandler}
															checked={input?.type === 'AGENT'}
														/>
													}
													label="AGENT"
												/>
											</FormGroup>
											<FormGroup>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															name={'TECHNICIAN'}
															onChange={checkUserTypeHandler}
															checked={input?.type === 'TECHNICIAN'}
														/>
													}
													label="TECHNICIAN"
												/>
											</FormGroup>
										</div>
									</div>
								)}

								{/* Remember Me / Terms */}
								{loginView ? (
									<div className={'remember-info'}>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														checked={rememberMe}
														onChange={(e) => setRememberMe(e.target.checked)}
														size="small"
													/>
												}
												label="Remember me"
											/>
										</FormGroup>
										<a>Forgot Password?</a>
									</div>
								) : (
									<div className={'terms-privacy'}>
										<FormControlLabel
											control={
												<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} size="small" />
											}
											label={
												<>
													Agree with <a href="#">Terms & Condition</a> and <a href="#">Privacy Policy</a>
												</>
											}
										/>
									</div>
								)}

								{/* Buttons */}
								{loginView ? (
									<Button
										variant="contained"
										disabled={input.memberEmail === '' || input.password === ''}
										onClick={doLogin}
										sx={{
											width: '100%',
											padding: '14px',
											background: '#2F5233',
											borderRadius: '24px',
											textTransform: 'none',
											fontSize: '14px',
											fontWeight: '600',
										}}
									>
										Sign In
									</Button>
								) : (
									<Button
										variant="contained"
										disabled={
											input.nick === '' ||
											input.memberEmail === '' ||
											input.password === '' ||
											input.phone === '' ||
											input.type === '' ||
											!agreeTerms
										}
										onClick={doSignUp}
										sx={{
											width: '100%',
											padding: '14px',
											background: '#2F5233',
											borderRadius: '24px',
											textTransform: 'none',
											fontSize: '14px',
											fontWeight: '600',
										}}
									>
										Sign Up
									</Button>
								)}

								{/* Divider */}
								<div className={'divider'}>
									<span>or {loginView ? 'Sign In' : 'Sign Up'} with</span>
								</div>

								{/* Google Auth */}
								<button className={'google-signin'} onClick={handleGoogleAuth}>
									<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
									{loginView ? 'Sign In With Google' : 'Sign Up With Google'}
								</button>
							</Box>

							{/* Switch View */}
							<Box component="div" className={'ask-info'}>
								{loginView ? (
									<p>
										Don't have an account?
										<b onClick={() => viewChangeHandler(false)}>Sign Up</b>
									</p>
								) : (
									<p>
										Already have an account?
										<b onClick={() => viewChangeHandler(true)}>Sign In</b>
									</p>
								)}
							</Box>

							{/* User Avatars - FAQAT Sign In da ko'rinsin (loginView === true) */}
							{loginView && (
								<Box
									component="div"
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginTop: '20px',
										width: '100%',
									}}
								>
									{/* Avatar Container */}
									<Box
										component="div"
										sx={{
											display: 'flex',
											alignItems: 'center',
											background: '#',
											borderRadius: '50px',
											padding: '6px 12px',
											boxShadow: '0 4px 15px rgba(207, 100, 34, 0.3)',
										}}
									>
										{/* User Avatars */}
										<Box component="div" sx={{ display: 'flex', marginRight: '8px' }}>
											{/* Avatar 1 */}
											<Box
												component="div"
												sx={{
													width: '28px',
													height: '28px',
													borderRadius: '50%',
													border: '2px solid white',
													overflow: 'hidden',
													marginLeft: '-6px',
													'&:first-of-type': { marginLeft: 0 },
												}}
											>
												<img
													src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
													alt="User 1"
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											</Box>

											{/* Avatar 2 */}
											<Box
												component="div"
												sx={{
													width: '28px',
													height: '28px',
													borderRadius: '50%',
													border: '2px solid white',
													overflow: 'hidden',
													marginLeft: '-6px',
												}}
											>
												<img
												src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
													alt="User 2"
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											</Box>

											{/* Avatar 3 */}
											<Box
												component="div"
												sx={{
													width: '28px',
													height: '28px',
													borderRadius: '50%',
													border: '2px solid white',
													overflow: 'hidden',
													marginLeft: '-6px',
												}}
											>
												<img
													src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
													alt="User 3"
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											</Box>

											{/* Avatar 4 */}
											<Box
												component="div"
												sx={{
													width: '28px',
													height: '28px',
													borderRadius: '50%',
													border: '2px solid white',
													overflow: 'hidden',
													marginLeft: '-6px',
												}}
											>
												<img
													src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face"
													alt="User 4"
													style={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											</Box>

											{/* CN Badge */}
											<Box
												component="div"
												sx={{
													width: '28px',
													height: '28px',
													borderRadius: '50%',
													border: '2px solid white',
													marginLeft: '-6px',
													background: '#cf6422',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													fontSize: '10px',
													fontWeight: 'bold',
													color: 'white',
												}}
											>
												CN
											</Box>
										</Box>

										{/* Plus Icon */}
										<Box
											component="div"
											sx={{
												color: '#605e5e',
												fontSize: '16px',
												fontWeight: 'bold',
												margin: '0 8px',
											}}
										>
											+
										</Box>

										{/* You Badge */}
										<Box
											component="div"
											sx={{
												padding: '4px 8px',
												borderRadius: '12px',
												background: 'rgba(0, 0, 0, 0.3)',
												fontSize: '10px',
												fontWeight: '500',
												color: 'white',
											}}
										>
											you
										</Box>
									</Box>
								</Box>
							)}
						</Stack>

						{/* Right Side */}
						<Stack className={`right ${loginView ? 'kitchen-bg' : 'living-bg'}`}>
							<div className={'testimonial'}>
								<div className={'quote'}>
									"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
									totam rem aperiam, eaque ipsa quae ab illo inventore."
								</div>
								<div className={'author'}>
									<span className={'name'}>{loginView ? 'Cameron Williamson' : 'Annette Black'}</span>
									<span className={'role'}>{loginView ? 'Interior Designer' : 'Architecture'}</span>
								</div>
								<div className={'progress'}>
									<div className={'dot active'}></div>
									<div className={'dot'}></div>
									<div className={'dot'}></div>
								</div>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
