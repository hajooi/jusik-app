import { Metadata } from 'next';
import { PERSONALITY_PROFILES } from '@/data/investmentSurvey';
import { redirect } from 'next/navigation';

type Props = {
  params: { code: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = params.code?.toUpperCase();
  const profile = code && PERSONALITY_PROFILES[code] ? PERSONALITY_PROFILES[code] : null;

  if (profile) {
    const title = `내 투자 성향: ${profile.name} (${profile.code}) | 주식앱`;
    const description = `"${profile.tagline}" - 40문항으로 알아보는 나의 주식 투자 성향과 맞춤형 위험 관리법 진단`;
    const imageUrl = `https://jusik.app/types/${profile.code}.png`;
    const canonicalUrl = `https://jusik.app/tools/type/${profile.code}`;

    return {
      title,
      description,
      keywords: [
        '투자 성향 진단',
        '주식 MBTI',
        profile.name,
        profile.code,
        '주식 성향 테스트',
        '포트폴리오 추천',
        'jusik.app',
      ],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: '주식앱',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: `${profile.name} (${profile.code}) 3D 아이콘`,
          },
        ],
        locale: 'ko_KR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  }

  return {
    title: '투자 성향 진단 | 주식앱',
    description: '40문항으로 알아보는 나의 주식 투자 성향과 맞춤형 위험 관리법 진단',
  };
}

export default function DynamicTypePage({ params }: Props) {
  const code = params.code?.toUpperCase();
  redirect(`/tools/type?result=${code}`);
}
