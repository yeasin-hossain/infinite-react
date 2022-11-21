import { MDXProvider } from '@mdx-js/react';
import blogIndexRouteTree from '@www/blogIndex.json';

import { DocsPageFooter } from '@www/components/DocsFooter';

import { Toc } from '@www/components/Layout/Toc';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { Seo } from '@www/components/Seo';
import { getAuthor } from '@www/utils/getAuthor';
import toCommaSeparatedList from '@www/utils/toCommaSeparatedList';
import format from 'date-fns/format';
import { useRouter } from 'next/router';
import * as React from 'react';
import { HighlightBrandToLightBackground } from '../components.css';

import { Page } from './Page';
import { RouteItem, useRouteMeta } from './useRouteMeta';
import { useTwitter } from './useTwitter';

interface PageFrontmatter {
  id?: string;
  title: string;
  draft?: boolean;
  description?: string;
  author: string[];
  date?: string;
}

interface LayoutPostProps {
  /** Sidebar/Nav */
  routes: RouteItem[];
  /** Markdown frontmatter */
  meta: PageFrontmatter;
  /** The mdx */
  children: React.ReactNode;
}

function formatDate(date: Date | string) {
  return format(new Date(date), 'MMMM dd, yyyy');
}
/** Return the date of the current post given the path */
function getDateFromPath(path: string) {
  // All paths are /blog/year/month/day/title
  const [year, month, day] = path
    .substr(1) // first `/`
    .split('/') // make an array
    .slice(1) // ignore blog
    .map((i) => parseInt(i, 10)); // convert to numbers

  return {
    date: formatDate(new Date(year, month, day)),
    dateTime: [year, month, day].join('-'),
  };
}

function LayoutPost({ meta, children }: LayoutPostProps) {
  const { pathname } = useRouter();

  const { route, nextRoute, prevRoute } = useRouteMeta();
  if (!route) {
    return null;
  }
  //@ts-ignore
  const { date, dateTime } = route.date
    ? //@ts-ignore
      { date: formatDate(route.date), dateTime: route.date }
    : getDateFromPath(pathname);

  const anchors = React.Children.toArray(children)
    .filter(
      (child: any) =>
        child.props?.mdxType && ['h2', 'h3'].includes(child.props.mdxType),
    )
    .map((child: any) => ({
      url: '#' + child.props.id,
      depth: parseInt(child.props.mdxType.replace('h', ''), 0),
      text: child.props.children,
    }));

  /* eslint-disable react-hooks/rules-of-hooks */
  useTwitter();
  return (
    <>
      <div className="w-full px-4 sm:px-12">
        <div className=" h-full mx-auto relative overflow-x-hidden lg:pt-0  lg:pl-80 2xl:px-80 ">
          <div className="ml-0 2xl:mx-auto 2xl:max-w-7xl">
            <Seo
              title={meta.title}
              draft={meta.draft}
              description={`${
                meta.description || meta.title
              } | Infinite Table DataGrid for React`}
            />
            <div className=" ">
              <h1
                className={`mb-6 pt-8 inline-block text-4xl font-black md:text-5xl leading-snug tracking-tight text-content-color ${HighlightBrandToLightBackground}`}
              >
                {meta.title}
              </h1>
              <p className="mb-6 text-sm text-content-color">
                By{' '}
                {toCommaSeparatedList(meta.author, (author) => {
                  const url = getAuthor(author).url;

                  return <span key={url}>{getAuthor(author).name}</span>;
                  // return (
                  // <ExternalLink
                  //   key={url}
                  //   href={url}
                  //   className="text-link underline font-bold">
                  //   {getAuthor(author).name}
                  // </ExternalLink>
                  // );
                })}
                <span className="mx-2">·</span>
                <span className="lead inline-flex text-gray-50">
                  <time dateTime={dateTime}>{date}</time>
                </span>
              </p>

              {/* @ts-ignore */}
              <MDXProvider components={MDXComponents}>{children}</MDXProvider>
            </div>
          </div>

          <DocsPageFooter
            route={route}
            nextRoute={nextRoute}
            prevRoute={prevRoute}
          />
        </div>
      </div>
      <div className="w-full lg:max-w-xs h-full hidden 2xl:block">
        <Toc headings={anchors} />
      </div>
    </>
  );
}

function AppShell(props: { children: React.ReactNode }) {
  return (
    <Page
      blog
      routeTree={
        {
          title: 'Blog',
          heading: false,
          path: '/blog',
          routes: [
            {
              title: 'Blog',
              heading: false,
              path: '/blog',
              routes: blogIndexRouteTree.routes,
            },
          ],
        } as any as RouteItem
      }
      {...props}
    />
  );
}

export default function withLayoutPost(meta: any) {
  function LayoutPostWrapper(props: LayoutPostProps) {
    return <LayoutPost {...props} meta={meta} />;
  }

  LayoutPostWrapper.appShell = AppShell;
  LayoutPostWrapper.displayName = 'LayoutPostWrapper';

  return LayoutPostWrapper;
}
