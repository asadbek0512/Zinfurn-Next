import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { userVar } from '../../../apollo/store';
import { GET_SELLER_DASHBOARD } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { T } from '../../types/common';

const SellerDashboard: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);

	const { data, loading } = useQuery(GET_SELLER_DASHBOARD, {
		fetchPolicy: 'cache-and-network',
		skip: !user?._id,
	});

	const dash = data?.getSellerDashboard;
	const maxRevenue = Math.max(1, ...(dash?.salesTrend?.map((p: T) => p.revenue) ?? [0]));

	const money = (n: number) => '$' + Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

	const cards = dash
		? [
				{ label: t('Revenue'), value: money(dash.totalRevenue) },
				{ label: t('Orders'), value: dash.totalOrders },
				{ label: t('Items Sold'), value: dash.itemsSold },
				{ label: t('Active Listings'), value: dash.activeListings },
				{ label: t('Sold Listings'), value: dash.soldListings },
				{ label: t('Total Views'), value: dash.totalViews },
				{ label: t('Total Likes'), value: dash.totalLikes },
				{ label: t('Total Listings'), value: dash.totalListings },
		  ]
		: [];

	return (
		<div id="seller-dashboard-page" className="seller-dashboard">
			<Stack className="main-title-box">
				<Typography className="main-title">{t('Seller Dashboard')}</Typography>
				<Typography className="sub-title">{t('Your sales performance at a glance')}</Typography>
			</Stack>

			{loading && !dash ? (
				<div className="sd-empty">{t('Loading')}...</div>
			) : !dash ? (
				<div className="sd-empty">{t('No data')}</div>
			) : (
				<>
					<div className="sd-cards">
						{cards.map((c) => (
							<div key={c.label} className="sd-card">
								<span className="sd-card-value">{c.value}</span>
								<span className="sd-card-label">{c.label}</span>
							</div>
						))}
					</div>

					<div className="sd-grid">
						<div className="sd-panel">
							<div className="sd-panel-title">{t('Last 7 days')}</div>
							<div className="sd-chart">
								{dash.salesTrend?.map((p: T) => (
									<div key={p.date} className="sd-bar-col" title={`${p.date}: ${money(p.revenue)} · ${p.orders} ${t('orders')}`}>
										<div className="sd-bar" style={{ height: `${(p.revenue / maxRevenue) * 100}%` }} />
										<span className="sd-bar-label">{p.date.slice(5)}</span>
									</div>
								))}
							</div>
						</div>

						<div className="sd-panel">
							<div className="sd-panel-title">{t('Top Products')}</div>
							{dash.topProducts?.length ? (
								<div className="sd-top-list">
									{dash.topProducts.map((p: T, i: number) => (
										<div
											key={p.propertyId}
											className="sd-top-item"
											onClick={() => router.push(`/products/detail?id=${p.propertyId}`)}
										>
											<span className="sd-top-rank">{i + 1}</span>
											<img
												className="sd-top-img"
												src={p.propertyImage ? `${REACT_APP_API_URL}/${p.propertyImage}` : '/img/banner/header1.svg'}
												alt={p.propertyTitle}
												loading="lazy"
											/>
											<div className="sd-top-info">
												<span className="sd-top-name">{p.propertyTitle}</span>
												<span className="sd-top-meta">
													{p.soldQty} {t('sold')} · {money(p.revenue)}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="sd-empty">{t('No sales yet')}</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default SellerDashboard;
