import React from 'react';
import RepairedPropertyList from '../../libs/components/repairService/RepairedPropertyList';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TechnicianList from '../../libs/components/repairService/TechnicianList';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { LocaleContext, DEFAULT_LOCALE } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const RepairServicePage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<div id="mob-repair-service-page">
				<TechnicianList />
				<RepairedPropertyList />
			</div>
		);
	}

	return (
		<div className="repair-service-page">
			<section>
				<TechnicianList />
			</section>
			<section>
				<RepairedPropertyList />
			</section>
		</div>
	);
};

export default withLayoutBasic(RepairServicePage);
