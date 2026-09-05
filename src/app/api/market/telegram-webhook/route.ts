import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CALENDAR_EVENTS } from "@/data/marketCalendar";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7836688476:AAGJOs8nHrvRD-T1XPSIfY1wDSXKADQQS2Q";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const callbackQuery = body.callback_query;

    if (!callbackQuery) {
      return NextResponse.json({ ok: true });
    }

    const callbackData = callbackQuery.data;
    const messageId = callbackQuery.message?.message_id;
    const chatId = callbackQuery.message?.chat?.id;
    const originalText = callbackQuery.message?.text || "";

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    });

    if (callbackData.startsWith("reject:")) {
      const updatedText = `${originalText}\n\n❌ [반려됨] 데이터 반영이 취소되었습니다.`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: updatedText,
          parse_mode: "HTML",
        }),
      });
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    if (callbackData.startsWith("approve:")) {
      const parts = callbackData.split(":");
      const eventId = parts[1];
      const actualVal = parts[2];

      const supabase = getSupabaseAdmin();
      if (!supabase) throw new Error("Supabase admin not available");

      const { data: dbRecord } = await supabase
        .from("users")
        .select("simulator_settings")
        .eq("nickname", "__system_market_daily_cache__")
        .maybeSingle();

      let cachedData = dbRecord?.simulator_settings;
      if (!cachedData) {
        cachedData = { calendarEvents: CALENDAR_EVENTS };
      }

      const events = cachedData.calendarEvents || CALENDAR_EVENTS;
      const targetEvent = events.find((e: any) => e.id === eventId);
      if (targetEvent) {
        targetEvent.actual = actualVal;
      }
      cachedData.calendarEvents = events;

      await supabase.from("users").upsert({
        nickname: "__system_market_daily_cache__",
        pin: "000000",
        simulator_settings: cachedData,
        last_active_at: new Date().toISOString(),
      });

      const updatedText = `${originalText}\n\n✅ [반영 완료] 발표치(<b>${actualVal}</b>)가 jusik.app 증시 캘린더에 즉시 반영되었습니다!`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: updatedText,
          parse_mode: "HTML",
        }),
      });

      return NextResponse.json({ ok: true, status: "approved", eventId, actualVal });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: false, error: err?.message });
  }
}
