// pages/repairService/index.tsx
import React from 'react';
import RepairedPropertyList from '../../libs/components/repairService/RepairedPropertyList';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TechnicianList from '../../libs/components/repairService/TechnicianList';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const RepairServicePage = () => {
	return (
		<div className="repair-service-page">
			{/* Ustalar */}
			<section>
				<TechnicianList />
			</section>

			{/* Ta’mirlangan Mulklar */}
			<section>
				<RepairedPropertyList />
			</section>
		</div>
	);
};

export default withLayoutBasic(RepairServicePage);
