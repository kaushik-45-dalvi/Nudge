import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nudge.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/room/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
