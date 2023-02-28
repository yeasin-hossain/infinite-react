import blogIndexRouteTree from '@www/blogIndex.json';
import { HighlightBrandToLightBackground } from '@www/components/components.css';
import { ExternalLink } from '@www/components/ExternalLink';

import { Page } from '@www/components/Layout/Page';
import { RouteItem } from '@www/components/Layout/useRouteMeta';

import styles from '@www/components/MDX/MDXComponents.module.css';
import { Seo } from '@www/components/Seo';
import { getAuthor } from '@www/utils/getAuthor';
import { removeFromLast } from '@www/utils/removeFromLast';
import toCommaSeparatedList from '@www/utils/toCommaSeparatedList';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import Link from 'next/link';
import * as React from 'react';

export default function RecentPosts() {
  return (
    <>
      <div className="w-full lg:pt-0  pl-0 lg:pl-80 2xl:px-80 ">
        <div className="max-w-7xl px-4 sm:px-12 mx-auto w-full container pt-4 ">
          <header className=" pb-8 ">
            <div className="inline-flex items-center mb-8">
              <Seo
                title="Blog"
                description="Official Infinite Table React news, announcements, and release notes. Infinite Table is the modern DataGrid for building React apps — faster."
              />

              <h1
                className={`text-5xl py-4 font-black tracking-tighter text-content-color ${HighlightBrandToLightBackground}`}
              >
                Infinite Blog
              </h1>
              {/* <a
                href="/feed.xml"
                className="p-2 betterhover:hover:bg-gray-20 transition duration-150 ease-in-out rounded-lg inline-flex items-center">
                <IconRss className="w-5 h-5 mr-2" />
                RSS
              </a> */}
            </div>
            <p className="text-content-color opacity-70 text-xl leading-large">
              News, announcements and release notes on Infinite Table.
            </p>
          </header>
          <div className="space-y-12 pb-40">
            {blogIndexRouteTree.routes
              .filter((post) => !post.draft)
              .map((post) => (
                <div key={post.path}>
                  <h3 className="font-bold leading-8 text-content-color text-2xl mb-2 hover:underline">
                    <Link href={removeFromLast(post.path, '.')}>
                      {post.title}
                    </Link>
                  </h3>
                  <div
                    className={styles.markdown + ' mb-0'}
                    dangerouslySetInnerHTML={{
                      __html: post.excerpt?.trim(),
                    }}
                  />
                  <div className="flex items-center mt-2">
                    <div>
                      <p className="text-sm leading-5 ">
                        By{' '}
                        {toCommaSeparatedList(post.author, (author) => (
                          <ExternalLink
                            href={getAuthor(author).url}
                            className="font-bold betterhover:hover:underline"
                          >
                            <span>{getAuthor(author).name}</span>
                          </ExternalLink>
                        ))}
                      </p>
                      <div className="flex text-sm leading-5  ">
                        <time dateTime={post.date}>
                          {format(parseISO(post.date), 'MMMM dd, yyyy')}
                        </time>
                        <span className="mx-1">·</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {/* <div className="text-center">
              <Link href="/blog/all">
                <a className="px-4 py-1.5 hover:bg-opacity-80 text-center bg-link text-white  font-bold   transition duration-150 ease-in-out rounded-lg inline-flex items-center">
                  View all articles
                </a>
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      <div className="pt-20 w-full lg:max-w-xs lg:sticky top-0 h-full hidden xl:block"></div>
    </>
  );
}

RecentPosts.displayName = 'Index';

RecentPosts.appShell = function AppShell(props: { children: React.ReactNode }) {
  // console.log(blogIndexRecentRouteTree);
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
};
