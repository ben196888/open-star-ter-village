import Head from 'next/head';
import Headline from '../components/headline';
import CardsGrid from '../components/cardsGrid';

import { fetchCards } from '../lib/fetchCards';
import { getNavigationList } from '../lib/getNavigationList';

/**
 *
 * @type {import('next').GetStaticProps}
 */
export const getStaticProps = async ({ locale }) => {
  const cards = await fetchCards(locale);

  // Get correct image path
  const updatedCards = cards.map((card) => {
    const updatedImage = card.frontMatter.image
      ? card.frontMatter.image.replace('/homepage/public', '')
      : '/images/uploads/初階專案卡封面-01.png';

    // Workaround for image prefix path. Will be removed after image path is fixed in all cards.
    const image = !updatedImage.startsWith('/')
      ? `/${updatedImage}`
      : updatedImage;

    return {
      ...card,
      frontMatter: {
        ...card.frontMatter,
        image,
      },
    };
  });

  const navigationList = await getNavigationList(locale);

  const title = {
    en: 'Card Introduction',
    'zh-tw': '卡片介紹',
  };

  const projectCardTitle = {
    en: 'Project Card',
    'zh-tw': '專案卡',
  };

  const jobCardTitle = {
    en: 'Job Card',
    'zh-tw': '人力卡',
  };

  const eventCardTitle = {
    en: 'Event Card',
    'zh-tw': '事件卡',
  };

  const projectCardSubtitle = {
    'open gov': {
      en: 'Open Government',
      'zh-tw': '開放政府專案',
    },
    'open data': {
      en: 'Open Data',
      'zh-tw': '開放資料專案',
    },
    'open source': {
      en: 'Open Source',
      'zh-tw': '開放原始碼專案',
    },
  };

  const headInfo = {
    title: {
      en: `OpenStarTerVillage - Card Introduction`,
      'zh-tw': `開源星手村 - 卡片介紹`,
    },
  };

  return {
    props: {
      cards: updatedCards,
      navigationList,
      headInfo: {
        title: headInfo.title[locale],
      },
      title: title[locale],
      projectCardTitle: projectCardTitle[locale],
      jobCardTitle: jobCardTitle[locale],
      eventCardTitle: eventCardTitle[locale],
      projectCardSubtitle: {
        'open gov': projectCardSubtitle['open gov'][locale],
        'open data': projectCardSubtitle['open data'][locale],
        'open source': projectCardSubtitle['open source'][locale],
      },
    },
  };
};

const cards = ({
  cards,
  headInfo,
  title,
  projectCardTitle,
  jobCardTitle,
  eventCardTitle,
  projectCardSubtitle,
}) => {
  return (
    <>
      <Head>
        <title>{headInfo.title}</title>
        <meta name="description" content="" />
      </Head>
      <Headline title={title} />
      <CardsGrid
        id={`project-cards`}
        title={projectCardTitle}
        cards={cards}
        filter={`project`}
        projectCardSubtype={`open gov`}
        projectCardSubtitle={projectCardSubtitle['open gov']}
      />
      <CardsGrid
        id={`project-cards`}
        title={projectCardTitle}
        cards={cards}
        filter={`project`}
        projectCardSubtype={`open data`}
        projectCardSubtitle={projectCardSubtitle['open data']}
      />
      <CardsGrid
        id={`project-cards`}
        title={projectCardTitle}
        cards={cards}
        filter={`project`}
        projectCardSubtype={`open source`}
        projectCardSubtitle={projectCardSubtitle['open source']}
      />
      <CardsGrid
        id={`job-cards`}
        title={jobCardTitle}
        cards={cards}
        filter={`job`}
      />
      <CardsGrid
        id={`event-cards`}
        title={eventCardTitle}
        cards={cards}
        filter={`event`}
      />
    </>
  );
};

export default cards;
