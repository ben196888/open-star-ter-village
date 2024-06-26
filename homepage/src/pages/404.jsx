import Head from 'next/head';
import { getLayout } from '../lib/service/getLayout';

/**
 *
 * @type {import('next').GetStaticProps}
 */
export const getStaticProps = async ({ locale }) => {
  const headInfo = {
    title: {
      en: `OpenStarTerVillage - Page Not Found`,
      'zh-Hant': `開源星手村 - 找不到網頁`,
    },
  };

  const desc = {
    en: `
      Bug report? Ask TwoMore. <a href="https://forms.gle/t9j8dbiKUohny8PZ8">Filling the form</a> to report a bug!
    `,
    'zh-Hant': `
      有問題？找兔摩。<a href="https://forms.gle/t9j8dbiKUohny8PZ8">填寫表單</a>回報你找到的問題吧！
    `,
  };

  const layout = await getLayout(locale);

  return {
    props: {
      headInfo: {
        title: headInfo.title[locale],
        description: '',
      },
      desc: desc[locale],
      layout,
    },
  };
};

const NotFoundPage = ({ headInfo, desc }) => (
  <>
    <Head>
      <title>{headInfo.title}</title>
      <meta name="description" content={headInfo.description} />
    </Head>
    <div className="site-container not-found-page">
      <div className="container text-center">
        <h1>NOT FOUND</h1>
        <p
          dangerouslySetInnerHTML={{
            __html: desc,
          }}
        ></p>
      </div>
    </div>
  </>
);

export default NotFoundPage;
