import { NextResponse } from 'next/server';
import { sendTelegramErrorAlert } from '@/utils/telegram';

type ApiHandler = (request: Request, context?: any) => Promise<Response | NextResponse> | Response | NextResponse;

interface GuardOptions {
  jobName: string;
}

/**
 * 전역 API 가디언 (withApiGuard)
 * 
 * 모든 Next.js Route Handler에 씌울 수 있는 고차 함수(HOF)입니다.
 * - 예상치 못한 500 런타임 크래시를 자동 포획합니다.
 * - 관리자 텔레그램으로 에러 발생 위치, 스택, 요청 정보를 즉시 직보합니다.
 * - 클라이언트에는 표준화된 안전한 에러 JSON을 반환하여 서비스 장애를 방지합니다.
 * - 앞으로 새로운 API를 개발할 때도 withApiGuard만 감싸면 100% 자동 상속됩니다.
 */
export function withApiGuard(
  optionsOrName: string | GuardOptions,
  handler: ApiHandler
): ApiHandler {
  const options: GuardOptions = typeof optionsOrName === 'string'
    ? { jobName: optionsOrName }
    : optionsOrName;

  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      const errorMsg = error?.stack || error?.message || String(error);
      const url = request.url || '';
      const method = request.method || 'GET';

      console.error(`🚨 [withApiGuard] Error in ${options.jobName} (${method} ${url}):`, error);

      // 관리자 텔레그램으로 즉시 긴급 직보 (비동기 안전 전송)
      const alertDetails = [
        `• <b>엔드포인트</b>: <code>${method} ${new URL(url, 'http://localhost').pathname}</code>`,
        `• <b>오류 상세</b>: <code>${errorMsg.slice(0, 350)}</code>`
      ].join('\n');

      sendTelegramErrorAlert(options.jobName, alertDetails).catch((e) => {
        console.error('[withApiGuard] Failed to send telegram error alert:', e);
      });

      return NextResponse.json(
        {
          success: false,
          error: '서버 내부 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
  };
}
