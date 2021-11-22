import * as React from 'react';

import {
  fontSize,
  marginBottom,
  marginTop,
  paddingY,
  fontWeight,
  zIndex,
  centeredFlexColumn,
  position,
  shadow,
} from '../styles/utils.css';

import { title, width100 } from './components.css';
import { darkIcon, lightIcon } from './Layout/Nav/Nav';

export const Header = (props: { title: string }) => {
  return (
    <div
      className={[
        position.relative,
        // backgroundColorWhite,
        // shadow.md,
        marginBottom[10],
        paddingY[16],
        width100,
        centeredFlexColumn,
        'bg-wash dark:bg-wash-dark',
        'text-primary',
        'dark:text-primary-dark',
      ].join(' ')}>
      <div className="absolute  top-10 right-10">
        <div className="block dark:hidden">
          <button
            type="button"
            aria-label="Use Dark Mode"
            onClick={() => {
              window.__setPreferredTheme('dark');
            }}
            className=" lg:flex items-center h-full pr-2">
            {darkIcon}
          </button>
        </div>
        <div className="hidden dark:block">
          <button
            type="button"
            aria-label="Use Light Mode"
            onClick={() => {
              window.__setPreferredTheme('light');
            }}
            className=" lg:flex items-center h-full pr-2">
            {lightIcon}
          </button>
        </div>
      </div>
      <a className={`${position.relative}`} href="/">
        <img
          width={150}
          height={70}
          src="/logo-infinite.svg"
          className={zIndex[10]}
        />
      </a>

      <h1
        className={[
          title,
          marginTop[8],
          marginBottom[0],
          fontSize['4xl'],
          fontWeight.inherit,
        ].join(' ')}>
        {props.title}
      </h1>
    </div>
  );
};
