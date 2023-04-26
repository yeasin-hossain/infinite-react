import { MDXContent } from '@www/components/MDXContent';
import { Metadata } from 'next';
import { getCurrentPageForUrl } from './getCurrentPageForUrl';

import { metadata as meta } from '../docs/metadata';
import { asMeta } from '@www/utils/asMeta';
export const generateMetadata = async ({
  params,
}: {
  params: { rootMdPage: string[] };
}): Promise<Metadata> => {
  const url = `/${params.rootMdPage.join('/')}`;

  if (url === '/eula') {
    return {
      title: 'End User License Agreement | Infinite Table DataGrid for React',
      description: `End User License Agreement | ${meta.description}`,
    };
  }

  const page = getCurrentPageForUrl(url);

  const res = {
    title:
      page?.metaTitle ??
      (page?.title
        ? `${page?.title} | Infinite Table DataGrid for React`
        : null) ??
      meta.title,
    description: page?.metaDescription ?? page.description ?? meta.description,
  };

  return asMeta(res);
};
export default function Docs({
  params: { rootMdPage },
}: {
  params: { rootMdPage: string[] };
}) {
  const url = `/${rootMdPage.join('/')}`;

  const page = getCurrentPageForUrl(url);

  return <MDXContent>{page.body.code}</MDXContent>;
}
