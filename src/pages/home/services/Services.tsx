import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import style from './services.module.scss';
import spiner_onPageSEO from '@image/Spiner_onPageSEO.svg';
import spiner_linkBuilding from '@image/Spiner_linkBuilding.svg';
import spiner_articleCreation from '@image/Spiner_articleCreation.svg';
import centralImg from '@image/Central-picture.svg';

type ImgRef = React.MutableRefObject<HTMLImageElement | null>;
type TextRef = React.MutableRefObject<HTMLDivElement | null>;
type TextImgAssociation = [TextRef, ImgRef][];

const Services: React.FC = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const createdIntervals = useRef<NodeJS.Timeout[]>([]);
  const img_onPageSEO = useRef<HTMLImageElement | null>(null);
  const img_linkBuilding = useRef<HTMLImageElement | null>(null);
  const img_articleCreation = useRef<HTMLImageElement | null>(null);
  const text_onPageSEO = useRef<HTMLDivElement | null>(null);
  const text_linkBuilding = useRef<HTMLDivElement | null>(null);
  const text_articleCreation = useRef<HTMLDivElement | null>(null);
  const spinerRef = useRef<HTMLDivElement | null>(null);
  const defaultRotateInterval = 3000;

  const mapTextImg = useMemo(() => {
    const textImgAssociation: TextImgAssociation = [
      [text_onPageSEO, img_onPageSEO],
      [text_linkBuilding, img_linkBuilding],
      [text_articleCreation, img_articleCreation],
    ];
    return new Map(textImgAssociation);
  }, []);

  //
  function map_getKeyByValue(map: Map<TextRef, ImgRef>, target: ImgRef): TextRef | undefined {
    for (const [key, value] of map.entries()) {
      if (value.current === target.current) {
        return key;
      }
    }
  }

  const rotate = (boost = 1) => {
    const rotateStep = -120;
    const spiner = spinerRef.current;
    if (!spiner) throw new Error('spiner element does`nt exist');

    const rotateString = spiner.style.transform;
    let currentRotate = parseInt(rotateString.slice(rotateString.indexOf('(') + 1));
    if (isNaN(currentRotate)) currentRotate = 0;

    spiner.style.transform = `rotate(${currentRotate + rotateStep * boost}deg)`;
  };

  //apply styles to textBlock and spiner
  const applyStyle = useCallback(
    (hoverTextBlock: HTMLDivElement) => {
      const img_active = `${style.spinerImg} ${style.spinerImg_active}`;
      const img_disable = `${style.spinerImg}`;
      const hoverTextDecore = hoverTextBlock.children[0] as HTMLDivElement;
      const hoverTextRef = [...mapTextImg.keys()].find(key => key.current === hoverTextBlock);
      if (!hoverTextRef) {
        throw new Error(`Reference for ${hoverTextBlock} does'nt exist`);
      }

      const hoverImgRef = mapTextImg.get(hoverTextRef);
      if (!hoverImgRef || !hoverImgRef.current) {
        throw new Error(`Corresponding image reference ${hoverTextRef} does'nt exist`);
      }

      for (const [text, img] of mapTextImg.entries()) {
        if (text !== hoverTextRef) {
          const decor = text.current?.children[0] as HTMLDivElement;
          decor.style.opacity = '0';
          const imgElem = img.current as HTMLImageElement;
          imgElem.className = img_disable;
        }

        hoverTextDecore.style.opacity = '1';
        hoverImgRef.current.className = img_active;
      }
    },
    [mapTextImg]
  );

  //initial highlight spiner sector
  useLayoutEffect(() => {
    const img_active = `${style.spinerImg} ${style.spinerImg_active}`;
    const initialImg = img_onPageSEO.current;

    if (!initialImg) throw new Error('Provided image does`nt exist');
    initialImg.className = img_active;
    const correspondingText = map_getKeyByValue(mapTextImg, img_onPageSEO);

    if (!correspondingText) {
      throw new Error('Provided image hasn`t corresponding text');
    }
    if (!correspondingText.current) {
      throw new Error('Text for image does`nt exist');
    }
    const correspondingTextDecor = correspondingText.current.children[0] as HTMLDivElement;
    correspondingTextDecor.style.opacity = '1';

    //optimize perfomance when user switch browser tab or minimizes browser window
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        setAutoRotate(false);
        return;
      }
      setAutoRotate(true);
    });
  }, [mapTextImg]);

  //Auto Rotation algorithm
  useEffect(() => {
    const spiner = spinerRef.current!;
    const allCreatedIntervals = createdIntervals.current;

    if (!autoRotate) {
      allCreatedIntervals.forEach(interval => {
        clearInterval(interval);
      });
      createdIntervals.current = [];
      return;
    }

    //define current spiner position
    const rotateString = spiner.style.transform;
    let currentRotate = parseInt(rotateString.slice(rotateString.indexOf('(') + 1));
    if (isNaN(currentRotate)) currentRotate = 0;
    const currentTurn = Math.abs(currentRotate / 120);
    let elemIndex = currentTurn % 3; //finished turn in current turnover;

    //apply style after animation end
    spiner.ontransitionend = () => {
      const currentTarget = [...mapTextImg.keys()][elemIndex];
      const textBlock = currentTarget.current!;
      applyStyle(textBlock);
    };

    //rotate spiner to next position
    const rotateInterval = setInterval(() => {
      const nextElemIndex = elemIndex + 1;
      nextElemIndex < mapTextImg.size ? ++elemIndex : (elemIndex = 0);
      rotate();
    }, defaultRotateInterval);
    createdIntervals.current.push(rotateInterval);

    return () => {
      allCreatedIntervals.forEach(interval => {
        clearInterval(interval);
      });
      createdIntervals.current = [];
    };
  }, [autoRotate, mapTextImg, applyStyle]);

  //Activate image after hover
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setAutoRotate(false);
    const hoverTextBlock = event.currentTarget;
    const animateBlocksArr = [...mapTextImg.keys()];
    const indexOfLastElem = animateBlocksArr.length - 1;
    const indexOfTargetBlock = animateBlocksArr.findIndex(
      textRef => textRef.current === hoverTextBlock
    );

    const spiner = spinerRef.current;
    if (!spiner) throw new Error('Spiner element does`nt exist');
    const rotateString = spiner.style.transform;
    let currentRotate = parseInt(rotateString.slice(rotateString.indexOf('(') + 1));

    if (isNaN(currentRotate)) currentRotate = 0;
    const currentTurn = Math.abs(currentRotate / 120);
    const turnInTurnover = currentTurn % 3; //finished turn in current turnover;

    spiner.ontransitionend = () => {
      spiner.ontransitionend = null;
      applyStyle(hoverTextBlock);
    };

    const rotateBoost = (() => {
      if (indexOfTargetBlock === turnInTurnover) return 0;
      if (indexOfTargetBlock === 0 && turnInTurnover === indexOfLastElem) return 1;
      return indexOfTargetBlock - turnInTurnover;
    })();

    if (rotateBoost === 0) return;
    rotate(rotateBoost);
  };

  const handleMouseLeave = async () => {
    //bad code
    //whait before all transitions finished 700 - css transition duration, 20 - more delay
    const transitionDuration = 700 + 20;
    setTimeout(() => setAutoRotate(true), transitionDuration);
  };

  return (
    <section className="services">
      <h2 className={style.heading}>Services</h2>
      <div className={style.container}>
        <div onMouseLeave={handleMouseLeave} className={style.description}>
          <div
            id="text_onPageSEO"
            className={style.elem}
            ref={text_onPageSEO}
            onMouseEnter={handleMouseEnter}
          >
            <div className={style.elem_decor}></div>
            <div className={style.elemText}>
              <h4>Comprehensive On-page SEO</h4>
              <p>
                Discover a comprehensive suite of SEO services, including competitor site analysis,
                full website audits, page-specific audits, content and keyword optimization, SEO
                health checks, strategic linking, and meta tag optimization, ensuring your website
                is finely tuned for optimal performance.
              </p>
            </div>
          </div>
          <div
            id="text_linkBuilding"
            className={style.elem}
            ref={text_linkBuilding}
            onMouseEnter={handleMouseEnter}
          >
            <div className={style.elem_decor}></div>
            <div className={style.elemText}>
              <h4>Link Building</h4>
              <p>
                Forge a robust online presence with our Link Building Services, offering tailored
                strategies like backlink strategy development, outreach backlinks, guest and
                sponsored posts, crowd placements in blog comments and forums, competitor analysis,
                and customized placements for diverse niches and budgets.
              </p>
            </div>
          </div>
          <div
            id="text_articleCreation"
            className={style.elem}
            ref={text_articleCreation}
            onMouseEnter={handleMouseEnter}
          >
            <div className={style.elem_decor}></div>
            <div className={style.elemText}>
              <h4>Custom Article Creation</h4>
              <p>
                Craft a compelling digital narrative with our Custom Article Creation services. We
                specialize in writing SEO-optimized articles for internal blogs and sponsored
                articles for link building, tailoring each piece to niche specifics, analyzing
                keywords for relevance, and offering client-centric content that resonates with
                target audiences.
              </p>
            </div>
          </div>
        </div>
        <div className={style.animationWrap}>
          <div ref={spinerRef} className={style.spiner}>
            <img
              ref={img_onPageSEO}
              className={style.spinerImg}
              src={spiner_onPageSEO}
              alt="circle with enumerate of our services: on page SEO"
            />
            <img
              ref={img_linkBuilding}
              className={style.spinerImg}
              src={spiner_linkBuilding}
              alt="circle with enumerate of our services: link building"
            />
            <img
              ref={img_articleCreation}
              className={style.spinerImg}
              src={spiner_articleCreation}
              alt="circle with enumerate of our services: article creation"
            />
          </div>
          <div className={style.centralImg}>
            <img src={centralImg} alt="Rising trafic image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
