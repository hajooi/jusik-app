import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Yeti', // Naver Search Advisor Bot
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'GPTBot', // OpenAI ChatGPT web crawler
        allow: '/',
      },
      {
        userAgent: 'OAI-SearchBot', // SearchGPT / ChatGPT Search
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI search
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot', // Anthropic Claude
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google Gemini / AI Overviews
        allow: '/',
      },
      {
        userAgent: 'Applebot-Extended', // Apple Intelligence
        allow: '/',
      },
    ],
    sitemap: 'https://jusik.app/sitemap.xml',
    host: 'https://jusik.app',
  };
}
