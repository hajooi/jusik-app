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
  ];

  // Dynamic lesson routes from curriculum data
  CURRICULUM_DATA.forEach((level) => {
    level.lessons.forEach((lesson) => {
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
