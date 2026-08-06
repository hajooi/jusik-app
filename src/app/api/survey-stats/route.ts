import { NextResponse } from 'next/server';
import { getSurveyStats, recordSurveyResult } from '@/utils/serverDb';

// GET /api/survey-stats
export async function GET() {
  try {
    const stats = getSurveyStats();
    
    // Calculate percentage ratios for each type
    const percentages: Record<string, number> = {};
    if (stats.totalCount > 0) {
      Object.keys(stats.typeCounts).forEach((code) => {
        const count = stats.typeCounts[code] || 0;
        percentages[code] = Math.round((count / stats.totalCount) * 1000) / 10; // e.g. 12.5%
      });
    }

    return NextResponse.json({
      success: true,
      totalCount: stats.totalCount,
      typeCounts: stats.typeCounts,
      percentages
    });
  } catch (error) {
    console.error('API GET survey-stats error:', error);
    return NextResponse.json({ success: false, error: '통계 로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/survey-stats
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { typeCode } = body;

    if (!typeCode) {
      return NextResponse.json({ success: false, error: '성향 코드가 필요합니다.' }, { status: 400 });
    }

    const updatedStats = recordSurveyResult(typeCode);

    // Calculate percentage ratios for each type
    const percentages: Record<string, number> = {};
    if (updatedStats.totalCount > 0) {
      Object.keys(updatedStats.typeCounts).forEach((code) => {
        const count = updatedStats.typeCounts[code] || 0;
        percentages[code] = Math.round((count / updatedStats.totalCount) * 1000) / 10;
      });
    }

    return NextResponse.json({
      success: true,
      totalCount: updatedStats.totalCount,
      typeCounts: updatedStats.typeCounts,
      percentages,
      myTypePercentage: percentages[typeCode] || 0
    });
  } catch (error) {
    console.error('API POST survey-stats error:', error);
    return NextResponse.json({ success: false, error: '통계 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
