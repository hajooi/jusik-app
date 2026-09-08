import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

let supabaseAdminInstance: SupabaseClient | null = null;
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
    try {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          // Next.js App Router는 서버사이드 fetch 결과를 캐싱함.
          // Supabase는 내부적으로 fetch를 사용하므로 DB 변경이 즉시 반영되도록
          // 모든 Supabase 요청에 cache: 'no-store'를 강제 적용.
          fetch: (url: RequestInfo | URL, init?: RequestInit) =>
            fetch(url, { ...init, cache: 'no-store' }),
        },
      });
      return supabaseAdminInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase Admin client:', e);
    }
  }
  return null;
}


export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseClientInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase Client:', e);
    }
  }
  return null;
}
