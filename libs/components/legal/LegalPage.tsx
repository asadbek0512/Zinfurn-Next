import React from 'react';
import { useRouter } from 'next/router';
import SEO from '../common/SEO';
import { LEGAL_UPDATED, LegalDoc } from './legalContent';

const SITE_URL = 'https://zinfurn.uz';
const FALLBACK_LOCALE = 'en';

type LegalPageProps = { content: Record<string, LegalDoc>; path: string };

const LegalPage = ({ content, path }: LegalPageProps) => {
	const { locale = FALLBACK_LOCALE } = useRouter();
	const doc = content[locale] || content[FALLBACK_LOCALE];
	const localePrefix = locale === FALLBACK_LOCALE ? '' : `/${locale}`;

	return (
		<div className="legal-page">
			<SEO title={doc.title} description={doc.intro} url={`${SITE_URL}${localePrefix}${path}`} />
			<article className="legal-wrap">
				<h1>{doc.title}</h1>
				<p className="legal-updated">
					{doc.updatedLabel}: {LEGAL_UPDATED}
				</p>
				<p className="legal-intro">{doc.intro}</p>
				{doc.sections.map((section) => (
					<section key={section.title} id={section.id}>
						<h2>{section.title}</h2>
						{section.paragraphs[0] && <p>{section.paragraphs[0]}</p>}
						{section.items && (
							<ul>
								{section.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						)}
						{section.paragraphs.slice(1).map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</section>
				))}
			</article>
		</div>
	);
};

export default LegalPage;
