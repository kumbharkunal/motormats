import type { MetadataRoute } from 'next';

import { clientEnv } from '@/lib/env.client';

/**
 * Personal and transactional routes are disallowed: they are behind auth, carry
 * no search value, and crawling them only wastes budget on redirects.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/', '/cart', '/checkout', '/orders/'],
      },
    ],
    sitemap: clientEnv.NEXT_PUBLIC_APP_URL + '/sitemap.xml',
    host: clientEnv.NEXT_PUBLIC_APP_URL,
  };
}
