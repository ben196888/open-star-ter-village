import Head from 'next/head';
import contentMapper from '../layouts/contentMapper';
import { getLayout } from '../lib/service/getLayout';
import { getPage } from '../lib/service/getPage';

/**
 *
 * @type {import('next').GetStaticProps}
 */
export const getStaticProps = async ({ locale }) => {
  const headInfo = {
    title: {
      en: `OpenStarTerVillage - Resource`,
      'zh-Hant': `開源星手村 - 資源頁`,
    },
  };

  const page = await getPage('resource', locale);

  const layout = await getLayout(locale);

  return {
    props: {
      headInfo: {
        title: headInfo.title[locale],
        description: '',
      },
      page,
      layout,
    },
  };
};

export default function Resource({ page, headInfo }) {
  return (
    <>
      <Head>
        <title>{headInfo.title}</title>
        <meta name="description" content={headInfo.description} />
      </Head>
      {page.contentList?.map(contentMapper)}
    </>
  );
}
