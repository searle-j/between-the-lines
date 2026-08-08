import rss from '@astrojs/rss';
import { getPosts, postPath } from '../../lib/posts';
import { siteName, ui } from '../../i18n/ui';
import { withBase } from '../../lib/url';

export async function GET(context) {
  const posts = await getPosts('en');
  return rss({
    title: `${siteName} (EN)`,
    description: ui.en.description,
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: posts.map((post) => ({
      title: post.entry.data.title,
      pubDate: post.entry.data.date,
      description: post.entry.data.description,
      link: withBase(postPath(post)),
    })),
  });
}
