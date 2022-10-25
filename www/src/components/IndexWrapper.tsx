import {
  DotsBackgroundCls,
  HeroImageCls,
  HeroImageNormalCls,
  SpotlightHorizontalBackgroundCls,
} from '@www/components/components.css';
import { MainLayout } from '@www/layouts/MainLayout';

import Image from 'next/image';
import * as React from 'react';

import demoImage from '../../public/full-demo-image.png';
import { OverlineCls } from './Header.css';

import Link from 'next/link';
import { wwwVars } from '@www/styles/www-utils.css';
import { HighlightButton } from './HighlightButton';

import { SecondaryButton } from './SecondaryButton';

const debounce = require('debounce');

// const TSLogo = (
//   <svg
//     className="inline mx-1"
//     style={{ lineHeight: 0 }}
//     fill="none"
//     height="26"
//     viewBox="0 0 27 26"
//     width="27"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       clipRule="evenodd"
//       d="m.98608 0h24.32332c.5446 0 .9861.436522.9861.975v24.05c0 .5385-.4415.975-.9861.975h-24.32332c-.544597 0-.98608-.4365-.98608-.975v-24.05c0-.538478.441483-.975.98608-.975zm13.63142 13.8324v-2.1324h-9.35841v2.1324h3.34111v9.4946h2.6598v-9.4946zm1.0604 9.2439c.4289.2162.9362.3784 1.5218.4865.5857.1081 1.2029.1622 1.8518.1622.6324 0 1.2331-.0595 1.8023-.1784.5691-.1189 1.0681-.3149 1.497-.5879s.7685-.6297 1.0187-1.0703.3753-.9852.3753-1.6339c0-.4703-.0715-.8824-.2145-1.2365-.1429-.3541-.3491-.669-.6186-.9447-.2694-.2757-.5925-.523-.9692-.7419s-.8014-.4257-1.2743-.6203c-.3465-.1406-.6572-.2771-.9321-.4095-.275-.1324-.5087-.2676-.7011-.4054-.1925-.1379-.3409-.2838-.4454-.4379-.1045-.154-.1567-.3284-.1567-.523 0-.1784.0467-.3392.1402-.4824.0935-.1433.2254-.2663.3959-.369s.3794-.1824.6269-.2392c.2474-.0567.5224-.0851.8248-.0851.22 0 .4523.0162.697.0486.2447.0325.4908.0825.7382.15.2475.0676.4881.1527.7218.2555.2337.1027.4495.2216.6475.3567v-2.4244c-.4015-.1514-.84-.2636-1.3157-.3365-.4756-.073-1.0214-.1095-1.6373-.1095-.6268 0-1.2207.0662-1.7816.1987-.5609.1324-1.0544.3392-1.4806.6203s-.763.6392-1.0104 1.0743c-.2475.4352-.3712.9555-.3712 1.5609 0 .7731.2268 1.4326.6805 1.9785.4537.546 1.1424 1.0082 2.0662 1.3866.363.146.7011.2892 1.0146.4298.3134.1405.5842.2865.8124.4378.2282.1514.4083.3162.5403.4946s.198.3811.198.6082c0 .1676-.0413.323-.1238.4662-.0825.1433-.2076.2676-.3753.373s-.3766.1879-.6268.2473c-.2502.0595-.5431.0892-.8785.0892-.5719 0-1.1383-.0986-1.6992-.2959-.5608-.1973-1.0805-.4933-1.5589-.8879z"
//       fill={`${wwwVars.color.brand}`}
//       fillRule="evenodd"
//     ></path>
//   </svg>
// );
// const ReactLogo = (
//   <img
//     src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
//     alt=""
//     height="10"
//     width="40"
//     style={{ top: -2 }}
//     className={`inline-block relative`}
//   ></img>
// );

export function SpotlightBackground() {
  return (
    <div
      className={SpotlightHorizontalBackgroundCls}
      style={{
        height: 500,
        width: 500,
      }}
    ></div>
  );
}

export const HeroPicture = () => {
  const heroImageContainerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const heroImageContainer = heroImageContainerRef.current;
    let hasPerspective = true;
    const fn = debounce(() => {
      const limit = window.innerWidth < 700 ? 150 : 200;
      const shouldHavePerspective = window.scrollY < limit;

      if (shouldHavePerspective != hasPerspective) {
        hasPerspective = shouldHavePerspective;
        heroImageContainer?.classList[shouldHavePerspective ? 'remove' : 'add'](
          HeroImageNormalCls,
        );
      }
    }, 50);
    window.addEventListener('scroll', fn);

    return () => {
      window.removeEventListener('scroll', fn);
    };
  }, []);
  return (
    <Link href="/docs/latest/learn/getting-started/full-demo">
      <a className="cursor-pointer outline-none relative my-20" tabIndex={-1}>
        <div
          ref={heroImageContainerRef}
          className={`${HeroImageCls}`}
          style={{ zIndex: 10 }}
        >
          <Image src={demoImage} />
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-70 hover:opacity-90 bg-white hover:bg-white bg-opacity-0 hover:bg-opacity-10 z-10 cursor-pointer flex items-center justify-center"></div>
        </div>

        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-10 cursor-pointer flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <HighlightButton>See live demo</HighlightButton>
        </div>
      </a>
    </Link>
  );
};

export function MainContent({
  children,
  overline = true,
}: {
  children?: React.ReactNode;
  overline?: boolean;
}) {
  return (
    <main
      className={`flex flex-col flex-1 justify-center w-full items-center px-5 relative ${DotsBackgroundCls}  ${
        overline ? OverlineCls : ''
      }`}
    >
      {children}
    </main>
  );
}

export default function IndexWrapper({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <MainLayout title={title} subtitle={subtitle}>
      <HeroPicture />
      <div className={['relative w-full flex flex-col items-center'].join(' ')}>
        <div className="w-1/2">
          We believe a DataGrid component is only as good as its documentation.
          All our examples are interactive and they cover all the existing
          functionalities.
          <div className="mb-10 mt-10 justify-center lg:justify-end md:float-right block md:inline-block text-center">
            {/* <AccentButton href="/docs">
              Start Building <>&rarr;</>
            </AccentButton> */}
            <SecondaryButton className="mx-5">Read the docs</SecondaryButton>
          </div>
        </div>
      </div>
      <MainContent>{children}</MainContent>
    </MainLayout>
  );
}
