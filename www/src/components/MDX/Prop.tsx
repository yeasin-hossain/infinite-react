'use client';
import {
  DataSourceApi,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import cn from 'classnames';
import { useRef } from 'react';
import * as React from 'react';

import { Button } from '../Button';
import { IconChevron } from '../Icon/IconChevron';
import { IconClose } from '../Icon/IconClose';
import { IconCodeBlock } from '../Icon/IconCodeBlock';
import { MaxWidth } from '../Layout/MarkdownPage';
import { StyledInput } from '../StyledInput';

import { H4 } from './Heading';
import InlineCode from './InlineCode';
import Link from './Link';
import { newvars } from '@www/styles/www-utils';

import debounce from 'debounce';
import { Blockquote } from './Blockquote';
import { usePathname } from 'next/navigation';

interface PropProps {
  children: React.ReactNode;
  name: string;
  type?: string;
  excerpt?: React.ReactNode;

  hidden?: boolean;
  highlight?: boolean;
  defaultValue?: string | number | boolean | null | undefined;
}

export const PropLink = ({
  name,
  children,
  code = true,

  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let theName = name;
  if (!name && typeof children === 'string') {
    theName = children as keyof InfiniteTableProps<any>;
  }

  const pathname = usePathname();
  let path = '/docs/reference/infinite-table-props';
  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${theName as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? theName}</InlineCode>
  ) : (
    children ?? theName
  );
  return <Link href={href}>{content}</Link>;
};

export const DataSourcePropLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  const pathname = usePathname();
  let path = '/docs/reference/datasource-props';
  if (pathname === path) {
    path = ''; // we're on this page already
  }

  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

export const DApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/datasource-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

export const ApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

export const LearnLink = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  const href = `/docs/learn/${name as string}`;

  const content = children ?? name;
  return <Link href={href}>{content}</Link>;
};

export const HookLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/hooks';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

const PropInlineCode = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      title={typeof children === 'string' ? children : undefined}
      style={style}
      className={cn(
        'rounded-lg inline-block bg-gray-90 px-2 text-content-color font-mono text-code whitespace-pre max-w-full overflow-hidden overflow-ellipsis',
        className,
      )}
    >
      {children}
    </div>
  );
};

export function Prop({
  children,
  name,
  defaultValue,
  hidden,
  highlight,
  excerpt,
  type,
}: PropProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (hidden) {
    return null;
  }

  const [first, ...rest] = React.Children.toArray(children);
  const inlineExcerpt =
    React.isValidElement(first) && first.type === Blockquote;

  if (inlineExcerpt) {
    //@ts-ignore
    excerpt = first.props.children;
  }

  const content = React.Children.toArray(inlineExcerpt ? rest : children);
  const hasDetails = !!content.length;

  const expanded = isExpanded && hasDetails;

  return (
    <div
      className={cn(
        'my-6 rounded-lg shadow-inner relative',

        `bg-opacity-40 bg-secondary`,
      )}
    >
      <div
        className={`p-8 flex flex-row ${
          expanded ? 'rounded-b-none rounded-lg' : 'rounded-lg'
        } ${highlight ? 'bg-brand-dark' : ''}`}
      >
        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-row w-full items-center flex-wrap ">
            {/* The pt and mt hack is for when there's anchor navigation, in order to accomodate for the fixed navbar and search field */}
            <H4
              as="h2"
              id={name.replaceAll('.', '-')}
              className="pt-[80px] mt-[-80px]"
            >
              <IconCodeBlock className="inline mr-2 text-brand" />
              {name}
            </H4>

            {defaultValue !== undefined ? (
              <PropInlineCode className="sm:ml-4">
                Default:{' '}
                {defaultValue === false
                  ? 'false'
                  : defaultValue === true
                  ? 'true'
                  : defaultValue === null
                  ? 'null'
                  : defaultValue}
              </PropInlineCode>
            ) : null}

            {type ? (
              <>
                <div
                  className="flex flex-row justify-start flex-auto "
                  style={{ maxWidth: '90%' }}
                >
                  <PropInlineCode className="ml-3">{type}</PropInlineCode>
                </div>
              </>
            ) : null}
          </div>

          <div className="mb-4">
            {/* <h3 className="text-xl font-bold text-primary-dark">
            {name}
          </h3> */}
            {excerpt && <div>{excerpt}</div>}
          </div>
          {hasDetails ? (
            <Button
              active
              className={cn('inline-block self-start')}
              onClick={() => setIsExpanded((current) => !current)}
            >
              <span className="mr-1">
                <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
              </span>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className={cn('p-8 border-t border-deep-dark')}>{content}</div>
      ) : null}
    </div>
  );
}

type PropTableProps = {
  children: React.ReactNode;
};

export function PropTable({
  // name,
  children,
}: PropTableProps) {
  // const initialText = globalThis.location
  //   ? globalThis.location.hash.slice(1)
  //   : '';
  const initialText = '';

  const [filterText, doSetFilterText] = React.useState(initialText);
  const [hash, setHash] = React.useState(initialText);

  const resetSearch = React.useCallback((value = '') => {
    doSetFilterText(value);
    inputRef.current!.value = value;
  }, []);

  React.useLayoutEffect(() => {
    const initialText = globalThis.location
      ? globalThis.location.hash.slice(1).toLowerCase()
      : '';

    if (initialText) {
      const [search, value] = initialText.split('=');

      if (search === 'search' && value) {
        resetSearch(value);
      }
    }

    const onHashChange = debounce(function () {
      const currentLocation = globalThis.location;

      setHash(currentLocation ? currentLocation.hash.slice(1) : '');

      const hash = currentLocation
        ? currentLocation.hash.slice(1).toLowerCase()
        : '';
      console.log('hash changed', hash);

      if (hash) {
        // if (currentLocation.pathname !== initialPathname) {
        //   // when another PropTable is rendered (on route change, this doesn't get unmounted when going from infinite props to datasource props)
        //   // we need to reset the search
        //   console.log(
        //     'changing pathname from ',
        //     initialPathname,
        //     ' to ',
        //     currentLocation.pathname,
        //   );
        //   initialPathname = currentLocation.pathname;
        //   onValueChange('');
        //   return;
        // }

        const [search, value] = hash.split('=');

        if (search && search === 'search') {
          return resetSearch(value);
        }
      }

      resetSearch('');
    }, 200);

    window.addEventListener('hashchange', onHashChange);

    onHashChange();

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  React.useEffect(() => {
    if (filterText) {
      window.location.hash = `search=${filterText}`;
    }
  }, [filterText]);

  const childrenArray = React.Children.toArray(children);

  const lowerHash = hash.toLowerCase().replaceAll('-', '.');
  console.log({ lowerHash });

  let highlightedName = '';

  const contents = childrenArray.map((child) => {
    if (!React.isValidElement(child)) return null;

    if (child.props.name) {
      const name = child.props.name;
      const lowerName = name.toLowerCase();
      const highlight = lowerHash === lowerName;

      if (highlight) {
        highlightedName = name;
      }

      let hidden = child.props.hidden;

      if (!name) {
        hidden = true;
      }
      if (!hidden && filterText && !lowerName.includes(filterText)) {
        hidden = true;
      }
      return React.cloneElement(child, {
        //@ts-ignore
        hidden,
        highlight,
      });
    }

    return child;
  });

  React.useEffect(() => {
    if (globalThis.document && hash && highlightedName) {
      const id = hash.replaceAll('.', '-');
      const el = document.querySelector(`#${id}`);

      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, highlightedName]);

  const setFilterText = React.useMemo(() => {
    const debouncedFilter = debounce((text: string) => {
      requestAnimationFrame(() => {
        doSetFilterText(text);
      });
    }, 500);

    return debouncedFilter;
  }, [doSetFilterText]);

  const onValueChange = React.useCallback(
    (value: string) => {
      setFilterText(value.toLowerCase());

      if (!value) {
        window.location.hash = '';
      }
    },
    [setFilterText],
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent) => {
      const value: string = (event.target as any).value || '';

      onValueChange(value);
    },
    [onValueChange],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const inputChildren = (
    filterText ? (
      <IconClose
        className="mx-2 group-betterhover:hover:text-gray-70 hover:text-link cursor-pointer"
        onClick={() => {
          resetSearch('');

          window.location.hash = '';
          inputRef.current!.focus();
        }}
      />
    ) : null
  ) as React.ReactNode;

  return (
    <div className="my-4">
      <MaxWidth
        className={`sticky`}
        style={{
          top: newvars.header.lineHeight,
          zIndex: 1000,
        }}
      >
        <StyledInput
          ref={inputRef}
          className="flex-1 py-2 my-2 outline-none"
          defaultValue={filterText}
          //@ts-ignore
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {inputChildren}
        </StyledInput>
      </MaxWidth>
      {contents}
      {/* {children} */}
    </div>
  );
}
