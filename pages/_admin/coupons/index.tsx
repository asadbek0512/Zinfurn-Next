import React, { useState } from 'react';
import type { NextPage } from 'next';
import { gql, useMutation, useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box, Button, Chip, Divider, MenuItem, Select, Stack, Table, TableBody, TableCell,
	TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale as string, ['common'])) },
});

const GET_ALL_COUPONS = gql`
	query GetAllCouponsByAdmin {
		getAllCouponsByAdmin {
			_id
			couponCode
			couponType
			couponValue
			couponStatus
			maxUses
			usedCount
			minOrderAmount
			validUntil
			createdAt
		}
	}
`;

const CREATE_COUPON = gql`
	mutation CreateCoupon($input: CouponCreateInput!) {
		createCoupon(input: $input) { _id }
	}
`;

const UPDATE_COUPON = gql`
	mutation UpdateCouponByAdmin($input: CouponUpdateInput!) {
		updateCouponByAdmin(input: $input) { _id couponStatus }
	}
`;

const AdminCoupons: NextPage = () => {
	const { data, refetch } = useQuery(GET_ALL_COUPONS, { fetchPolicy: 'network-only' });
	const [createCoupon, { loading: creating }] = useMutation(CREATE_COUPON);
	const [updateCoupon] = useMutation(UPDATE_COUPON);

	const [code, setCode] = useState('');
	const [type, setType] = useState('PERCENT');
	const [value, setValue] = useState('');
	const [maxUses, setMaxUses] = useState('');
	const [minOrder, setMinOrder] = useState('');
	const [validUntil, setValidUntil] = useState('');

	const coupons = data?.getAllCouponsByAdmin ?? [];

	const submit = async () => {
		try {
			await createCoupon({
				variables: {
					input: {
						couponCode: code.trim(),
						couponType: type,
						couponValue: Number(value),
						maxUses: maxUses ? Number(maxUses) : 0,
						minOrderAmount: minOrder ? Number(minOrder) : 0,
						validUntil: validUntil ? new Date(validUntil) : null,
					},
				},
			});
			await sweetTopSmallSuccessAlert('Kupon yaratildi', 900);
			setCode(''); setValue(''); setMaxUses(''); setMinOrder(''); setValidUntil('');
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const toggleStatus = async (c: any) => {
		try {
			await updateCoupon({
				variables: { input: { _id: c._id, couponStatus: c.couponStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } },
			});
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Box component="div" sx={{ p: '24px', maxWidth: 1100 }}>
			<Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Kuponlar</Typography>

			{/* Yaratish formasi */}
			<Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 3, alignItems: 'center' }}>
				<TextField size="small" label="Kod" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} sx={{ width: 150 }} />
				<Select size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ width: 120 }}>
					<MenuItem value="PERCENT">% foiz</MenuItem>
					<MenuItem value="FIXED">Fiks summa</MenuItem>
				</Select>
				<TextField size="small" label={type === 'PERCENT' ? 'Foiz (1-100)' : 'Summa'} value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))} sx={{ width: 130 }} />
				<TextField size="small" label="Limit (0=cheksiz)" value={maxUses} onChange={(e) => setMaxUses(e.target.value.replace(/[^\d]/g, ''))} sx={{ width: 140 }} />
				<TextField size="small" label="Min buyurtma" value={minOrder} onChange={(e) => setMinOrder(e.target.value.replace(/[^\d]/g, ''))} sx={{ width: 130 }} />
				<TextField size="small" type="date" label="Muddati" InputLabelProps={{ shrink: true }} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} sx={{ width: 160 }} />
				<Button variant="contained" onClick={submit} disabled={creating || !code.trim() || !value}>
					Yaratish
				</Button>
			</Stack>
			<Divider sx={{ mb: 2 }} />

			{/* Ro'yxat */}
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Kod</TableCell>
							<TableCell>Chegirma</TableCell>
							<TableCell>Ishlatildi</TableCell>
							<TableCell>Min buyurtma</TableCell>
							<TableCell>Muddati</TableCell>
							<TableCell>Holat</TableCell>
							<TableCell />
						</TableRow>
					</TableHead>
					<TableBody>
						{coupons.map((c: any) => (
							<TableRow key={c._id}>
								<TableCell sx={{ fontWeight: 700 }}>{c.couponCode}</TableCell>
								<TableCell>{c.couponType === 'PERCENT' ? `${c.couponValue}%` : c.couponValue.toLocaleString()}</TableCell>
								<TableCell>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</TableCell>
								<TableCell>{c.minOrderAmount ? c.minOrderAmount.toLocaleString() : '—'}</TableCell>
								<TableCell>{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</TableCell>
								<TableCell>
									<Chip size="small" label={c.couponStatus} color={c.couponStatus === 'ACTIVE' ? 'success' : 'default'} />
								</TableCell>
								<TableCell>
									<Button size="small" onClick={() => toggleStatus(c)}>
										{c.couponStatus === 'ACTIVE' ? 'Pauza' : 'Yoqish'}
									</Button>
								</TableCell>
							</TableRow>
						))}
						{coupons.length === 0 && (
							<TableRow><TableCell colSpan={7} align="center" sx={{ color: 'var(--text-3)' }}>Hozircha kupon yo'q</TableCell></TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

export default withAdminLayout(AdminCoupons);
