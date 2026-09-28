import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useRouter } from 'next/router';
import { LocaleContext, DEFAULT_LOCALE } from '../../libs/types/common';

const AdminHome: NextPage = (props: any) => {
	const router = useRouter();

	/** LIFECYCLES **/
	useEffect(() => {
		router.push('/_admin/users');
	}, []);
	return <></>;
};

export default withAdminLayout(AdminHome);

export const getServerSideProps = async ({ locale }: LocaleContext) => ({
  props: { ...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])) },
});
