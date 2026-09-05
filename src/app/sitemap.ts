import { MetadataRoute } from 'next';
import { CURRICULUM_DATA } from '@/data/curriculum';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jusik.app';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/type`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/simulate`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/terms`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/market`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic lesson routes from curriculum data (Exclude unlisted/stealth lessons like lv1-3)
  CURRICULUM_DATA.forEach((level) => {
    level.lessons.forEach((lesson) => {
      if (lesson.id === 'lv1-3') return; // 유튜브 '일부 공개'와 동일하게 sitemap 제외
      routes.push({
        url: `${baseUrl}/lesson/${lesson.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  });

  return routes;
}
