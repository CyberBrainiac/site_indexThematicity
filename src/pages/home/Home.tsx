import React, { useEffect } from 'react';
import style from './home.module.scss';
import Tools from './tools/Tools';
import Hero from './hero/Hero';
import OnPageSEO from './onPageSEO/OnPageSEO';
import ArticleCreation from './articleCreation/ArticleCreation';
import AboutUs from './aboutUs/AboutUs';
import LinkBuilding from './linkBuilding/LinkBuilding';
import Services from './services/Services';

const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'SEO-Buy: link building and SEO services';
    const newMetaDescription = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement;
    newMetaDescription.content = `Explore innovative SEO solutions, strategic link building, and captivating custom content creation. Welcome to SEO-Buy – where digital excellence begins and your brand's success story unfolds.`;
  }, []);

  return (
    <section className="home">
      <div className={style.container}>
        <Hero />
        <Tools />
        <OnPageSEO />
        <LinkBuilding />
        <ArticleCreation />
        <Services />
        <AboutUs />
      </div>
    </section>
  );
};

export default Home;
