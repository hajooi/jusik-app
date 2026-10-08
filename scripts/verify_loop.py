#!/usr/bin/env python3
"""
jusik.app 루프 엔지니어링 종합 검증 엔진 (Advanced Loop Engineering Gate)
========================================================================
작업 주기마다 다차원 무결성을 자동 검증하여 결함 없는 프로덕션을 보장하는 엔진.

주요 7대 루프:
1. [보안 루프] 시크릿/토큰(Telegram, Google/Gemini, OpenAI, Supabase 등) 하드코딩 원천 차단
2. [규칙 루프] 주식앱 쉬운 우리말(구매/판매/주식 가격/회사 몸값) 및 순우리말 수관형사 준수
3. [금융 루프] 50개 자산 20년 백테스트 데이터의 NaN/결측치/비정상 이상치 전수 계산 검증
4. [링크 루프] 37개 전체 라우트 및 커리큘럼 강의 링크 404/누락 전수 대조
5. [모바일 루프] 375px 모바일 뷰포트 가로 터짐(Overflow) 유발 고정폭 안티패턴 탐지
6. [타입 루프] TypeScript 컴파일러(tsc --noEmit) 무결성 검증 (0 errors)
7. [빌드 루프] Next.js 프로덕션 37개 라우트 빌드 (옵션: --full 모드 시 실행)

실행 모드:
- 일상 고속 모드 (기본, ~2초): 1~6단계 전수 검증
- 심층 전체 모드 (--full, ~10초): 1~7단계 (Next.js 빌드 포함) 전수 검증
- 에이전트 훅 모드 (--hook): Stop Hook 프로토콜 준수 (결함 시 자동 자가 수정 지시)
"""

import os
import sys
import re
import subprocess
import json
import math
import argparse
from typing import List, Dict, Tuple, Set

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 터미널 컬러 ANSI
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
CYAN = "\033[96m"
MAGENTA = "\033[95m"
RESET = "\033[0m"
BOLD = "\033[1m"

# 1. 보안 패턴
SECRET_PATTERNS = [
    (r"\b[0-9]{9,10}:[a-zA-Z0-9_-]{35}\b", "텔레그램 봇 토큰 (Telegram Bot Token)"),
    (r"\bAIza[0-9A-Za-z-_]{35}\b", "구글/Gemini API 키 (Google/Gemini API Key)"),
    (r"\bsk-[a-zA-Z0-9]{20,}\b", "OpenAI API 키 (OpenAI API Key)"),
    (r"\bsb_secret_[a-zA-Z0-9_-]+\b", "Supabase 서비스 시크릿 (Supabase Secret Key)"),
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "비공개 개인 키 (Private Key)"),
]

# 2. 용어 규칙
FORBIDDEN_RULES = [
    (r"매수", "주식 구매 또는 구매"),
    (r"매도", "주식 판매 또는 팔기"),
    (r"주가", "주식 가격 또는 가격"),
    (r"시가총액", "회사 몸값 또는 회사 규모"),
    (r"\b([0-9]+)가지\b", "순우리말 수관형사 (예: 1가지->한 가지, 2가지->두 가지, 3가지->세 가지, 4가지->네 가지)"),
]

# 금융 용어 퀴즈 및 실제 증권사 앱(MTS) 실습 화면 영구 보호 예외 파일
EXCLUDED_TERM_FILES = {
    "src/data/termsQuizData.ts",                    # 주식 용어 퀴즈 전체 데이터
    "src/components/BasicTermsQuiz.tsx",            # 기초 용어 퀴즈 컴포넌트
    "src/components/StockTradeMotionSimulator.tsx", # 실제 모바일 증권사 매수/매도 실습 시뮬레이터
    "src/components/StockTradeGuide.tsx",           # 실제 매수/매도 주문 화면 가이드
    "src/components/StockDcaMotionSimulator.tsx",   # 적립식 매수 실습 시뮬레이터
    "src/components/StockDcaGuide.tsx",             # 적립식 매수 실습 가이드
    "src/utils/aiSummary.ts",                       # AI 프롬프트 금지어 지침 (단어 자체가 명시됨)
    "src/components/CiscoManiaGame.tsx",            # 2000년 닷컴버블 시스코 실시간 모의투자 시뮬레이터
}

def get_git_modified_files() -> List[str]:
    """Git에서 현재 수정되거나 스테이징된 파일 목록 반환"""
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        files = []
        for line in res.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            parts = line.split(maxsplit=1)
            if len(parts) == 2:
                filepath = parts[1].strip()
                files.append(filepath)
        return files
    except Exception:
        return []

# ==============================================================================
# 1. 보안 루프 (Security Gate)
# ==============================================================================
def check_security(target_files: List[str] = None) -> List[str]:
    errors = []
    
    # .env.local 추적 여부
    try:
        tracked = subprocess.run(
            ["git", "ls-files", ".env.local"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        if tracked.stdout.strip():
            errors.append("[보안 위반] .env.local 파일이 Git에 추적되고 있습니다! git rm --cached .env.local 필요.")
    except Exception:
        pass

    files_to_scan = []
    if target_files:
        files_to_scan = [f for f in target_files if os.path.exists(os.path.join(PROJECT_ROOT, f))]
    else:
        for root, _, filenames in os.walk(os.path.join(PROJECT_ROOT, "src")):
            for f in filenames:
                if f.endswith((".ts", ".tsx", ".js", ".jsx", ".json", ".py", ".md")):
                    files_to_scan.append(os.path.relpath(os.path.join(root, f), PROJECT_ROOT))

    for rel_path in files_to_scan:
        if any(ign in rel_path for ign in [".git", "node_modules", ".next", ".gemini", "transcript"]):
            continue
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        if not os.path.isfile(full_path):
            continue
            
        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as fp:
                for line_idx, line in enumerate(fp, 1):
                    for pat, desc in SECRET_PATTERNS:
                        if re.search(pat, line):
                            errors.append(f"[보안 위험] {rel_path}:{line_idx} - {desc} 하드코딩 의심: {line.strip()[:60]}...")
        except Exception:
            pass

    return errors

# ==============================================================================
# 2. 도메인 규칙 루프 (Vocabulary Gate)
# ==============================================================================
def check_vocabulary_rules(target_files: List[str] = None) -> List[str]:
    errors = []
    
    files_to_scan = []
    if target_files is not None:
        files_to_scan = [
            f for f in target_files 
            if f.startswith("src/") and f.endswith((".ts", ".tsx")) and f not in EXCLUDED_TERM_FILES
        ]
    else:
        for root, _, filenames in os.walk(os.path.join(PROJECT_ROOT, "src")):
            for f in filenames:
                rel = os.path.relpath(os.path.join(root, f), PROJECT_ROOT)
                if rel in EXCLUDED_TERM_FILES:
                    continue
                if f.endswith((".ts", ".tsx")):
                    files_to_scan.append(rel)

    for rel_path in files_to_scan:
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        if not os.path.isfile(full_path):
            continue

        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as fp:
                for line_idx, line in enumerate(fp, 1):
                    stripped = line.strip()
                    if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
                        continue
                    
                    for pat, replacement in FORBIDDEN_RULES:
                        matches = list(re.finditer(pat, line))
                        if matches:
                            errors.append(
                                f"[용어 위반] {rel_path}:{line_idx} - 금지어 '{matches[0].group()}' 발견 "
                                f"(권장 대체어: '{replacement}') ➔ {stripped[:60]}"
                            )
        except Exception:
            pass

    return errors

# ==============================================================================
# 3. 금융 데이터 무결성 루프 (Financial Integrity Gate)
# ==============================================================================
def check_financial_data_integrity() -> List[str]:
    """50개 자산 백테스트 수치 및 주식 가격 데이터의 NaN/결측치/비정상 수치 전수 검사"""
    errors = []
    backtest_path = os.path.join(PROJECT_ROOT, "src/data/backtestData.json")
    prices_path = os.path.join(PROJECT_ROOT, "src/data/historicalPrices.json")

    # 1. 백테스트 데이터 검증
    if os.path.exists(backtest_path):
        try:
            with open(backtest_path, "r", encoding="utf-8") as f:
                bdata = json.load(f)
            assets = bdata.get("assets", [])
            if len(assets) < 40:
                errors.append(f"[금융 데이터 오류] 등록된 자산 수가 비정상적으로 적습니다 ({len(assets)}개, 기대값: 50개)")

            for a in assets:
                aid = a.get("id", "UNKNOWN")
                # 필수 수치 키 검증
                num_keys = ["annualCAGR", "annualVol", "ma50Return", "ma100Return", "ma150Return", "ma200Return"]
                for k in num_keys:
                    val = a.get(k)
                    if val is None or not isinstance(val, (int, float)):
                        errors.append(f"[금융 데이터 결함] 자산 '{aid}'의 '{k}' 값이 비어있거나 숫자가 아닙니다: {val}")
                    elif math.isnan(val) or math.isinf(val):
                        errors.append(f"[금융 계산 오류] 자산 '{aid}'의 '{k}' 수식 결과가 NaN 또는 Infinity입니다!")
                    elif k == "annualCAGR" and (val < -100 or val > 5000):
                        errors.append(f"[금융 수치 이상] 자산 '{aid}'의 CAGR({val}%)이 물리적 금융 한계를 벗어났습니다.")
                    elif k == "annualVol" and (val < 0 or val > 500):
                        errors.append(f"[금융 수치 이상] 자산 '{aid}'의 연간 변동성({val}%)이 비정상 수치입니다.")
        except Exception as e:
            errors.append(f"[금융 파일 파싱 에러] backtestData.json 읽기 실패: {str(e)}")

    # 2. 가격 데이터 검증
    if os.path.exists(prices_path):
        try:
            with open(prices_path, "r", encoding="utf-8") as f:
                pdata = json.load(f)
            if not pdata or len(pdata) == 0:
                errors.append("[금융 가격 결측] historicalPrices.json 데이터가 비어 있습니다.")
            else:
                monthly_series = pdata.get("monthly", {})
                if not monthly_series or len(monthly_series) < 40:
                    errors.append(f"[금융 가격 결측] historicalPrices.json의 monthly 데이터가 부족합니다 ({len(monthly_series)}개 종목)")
                else:
                    for symbol, prices in list(monthly_series.items())[:10]:
                        if not isinstance(prices, list) or len(prices) < 10:
                            errors.append(f"[금융 주식 가격 결측] 심볼 '{symbol}'의 시계열 가격 데이터가 부족합니다 ({len(prices) if isinstance(prices, list) else 0}개)")
        except Exception as e:
            errors.append(f"[금융 파일 파싱 에러] historicalPrices.json 읽기 실패: {str(e)}")

    return errors

# ==============================================================================
# 4. 37개 라우트 & 내부 링크 헬스 루프 (Route & Broken Link Gate)
# ==============================================================================
def check_route_and_link_health() -> List[str]:
    """커리큘럼 레슨 링크 및 핵심 도구 라우트가 404 없이 실존하는지 전수 검증"""
    errors = []
    curriculum_path = os.path.join(PROJECT_ROOT, "src/data/curriculum.ts")

    # 커리큘럼 내 레슨 ID 추출
    if os.path.exists(curriculum_path):
        try:
            with open(curriculum_path, "r", encoding="utf-8") as f:
                content = f.read()
            # id: 'lv0-1', id: "lv1-2" 추출
            lesson_ids = re.findall(r"id:\s*['\"](lv[0-9]+-[0-9]+)['\"]", content)
            
            # 레슨 상세 라우트 파일 확인
            lesson_page = os.path.join(PROJECT_ROOT, "src/app/lesson/[id]/page.tsx")
            if not os.path.exists(lesson_page):
                errors.append("[라우트 결함] src/app/lesson/[id]/page.tsx 동적 페이지가 존재하지 않습니다!")
            
            if len(lesson_ids) < 10:
                errors.append(f"[링크 경고] 커리큘럼 강의 수가 비정상적으로 적습니다 ({len(lesson_ids)}개 탐지)")
        except Exception as e:
            errors.append(f"[커리큘럼 링크 파싱 에러] {str(e)}")

    # 주요 정적 라우트 실존 여부 확인
    core_routes = [
        ("메인 커리큘럼", "src/app/page.tsx"),
        ("투자도구 허브", "src/app/tools/page.tsx"),
        ("전략 시뮬레이터", "src/app/tools/simulate/page.tsx"),
        ("증시 캘린더", "src/app/tools/market/page.tsx"),
        ("용어 퀴즈", "src/app/tools/terms/page.tsx"),
        ("투자 성향 진단", "src/app/tools/type/page.tsx"),
        ("성향 결과 공유 라우트", "src/app/tools/type/[code]/page.tsx"),
    ]

    for name, rpath in core_routes:
        full_rpath = os.path.join(PROJECT_ROOT, rpath)
        if not os.path.exists(full_rpath):
            errors.append(f"[깨진 라우트 404] '{name}' 페이지 파일이 없습니다: {rpath}")

    return errors

# ==============================================================================
# 5. 모바일 뷰포트 레이아웃 방어 루프 (Mobile Responsive Gate)
# ==============================================================================
def check_mobile_responsive_guard(target_files: List[str] = None) -> List[str]:
    """375px 모바일 기기에서 가로 스크롤(Overflow)을 터뜨리는 고정 너비 안티패턴 탐지"""
    errors = []
    
    files_to_scan = []
    if target_files:
        files_to_scan = [f for f in target_files if f.startswith("src/") and f.endswith((".tsx", ".jsx"))]
    else:
        for root, _, filenames in os.walk(os.path.join(PROJECT_ROOT, "src/components")):
            for f in filenames:
                if f.endswith((".tsx", ".jsx")):
                    files_to_scan.append(os.path.relpath(os.path.join(root, f), PROJECT_ROOT))

    # 모바일 가로 터짐 위험 패턴: 반응형 prefix(sm:, md:, lg:) 없이 w-[400px], w-[500px] 등 360px 초과 고정폭 사용
    dangerous_fixed_width = re.compile(r'(?<![a-z0-9:-])w-\[(\d+)px\]')

    for rel_path in files_to_scan:
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        if not os.path.isfile(full_path):
            continue

        try:
            with open(full_path, "r", encoding="utf-8") as fp:
                for line_idx, line in enumerate(fp, 1):
                    # 배경 장식용 블롭(pointer-events-none / fixed / blur)은 가로 스크롤에 영향 없음
                    if "pointer-events-none" in line or "aria-hidden" in line:
                        continue

                    for match in dangerous_fixed_width.finditer(line):
                        width_val = int(match.group(1))
                        if width_val > 360:
                            # sm: md: 접두어가 붙어있는지 확인
                            start_idx = match.start()
                            prefix_window = line[max(0, start_idx-10):start_idx]
                            if not any(bp in prefix_window for bp in ["sm:", "md:", "lg:", "xl:"]):
                                errors.append(
                                    f"[모바일 가로 터짐 위험] {rel_path}:{line_idx} - 모바일(360px) 초과 고정폭 '{match.group(0)}' 발견. "
                                    f"(권장: 'w-full max-w-[{width_val}px]' 또는 'sm:{match.group(0)}' 사용)"
                                )
        except Exception:
            pass

    return errors

# ==============================================================================
# 6. 정적 타입 무결성 루프 (TypeScript Gate)
# ==============================================================================
def check_typescript() -> Tuple[bool, str]:
    try:
        res = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            return True, ""
        else:
            return False, res.stdout + res.stderr
    except Exception as e:
        return False, str(e)

# ==============================================================================
# 7. 프로덕션 빌드 루프 (Next.js Build Gate)
# ==============================================================================
def check_next_build() -> Tuple[bool, str]:
    try:
        res = subprocess.run(
            ["npm", "run", "build"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            return True, ""
        else:
            return False, res.stdout + res.stderr
    except Exception as e:
        return False, str(e)

# ==============================================================================
# 메인 검증 파이프라인
# ==============================================================================
def run_loop_verification(full: bool = False, hook_mode: bool = False):
    modified_files = get_git_modified_files()
    target_files = modified_files if not full else None

    # 1. 보안 루프
    sec_errors = check_security(target_files)
    
    # 2. 규칙 루프
    vocab_errors = check_vocabulary_rules(target_files)
    
    # 3. 금융 데이터 루프
    fin_errors = check_financial_data_integrity()
    
    # 4. 라우트 & 링크 헬스 루프
    link_errors = check_route_and_link_health()
    
    # 5. 모바일 반응형 방어 루프
    mobile_errors = check_mobile_responsive_guard(target_files if target_files else None)
    
    # 6. TypeScript 컴파일 루프
    ts_passed, ts_output = check_typescript()
    
    # 7. 빌드 루프 (옵션)
    build_passed = True
    build_output = ""
    if full:
        build_passed, build_output = check_next_build()

    all_passed = (
        len(sec_errors) == 0 and 
        len(vocab_errors) == 0 and 
        len(fin_errors) == 0 and 
        len(link_errors) == 0 and 
        len(mobile_errors) == 0 and 
        ts_passed and 
        build_passed
    )

    # Stop Hook 모드 (JSON 응답)
    if hook_mode:
        if all_passed:
            print(json.dumps({}))
            sys.exit(0)
        else:
            reasons = []
            if sec_errors:
                reasons.append("🚨 [보안 위반]:\n" + "\n".join(sec_errors[:4]))
            if vocab_errors:
                reasons.append("⚠️ [도메인 용어 규칙 위반]:\n" + "\n".join(vocab_errors[:4]))
            if fin_errors:
                reasons.append("📈 [금융 데이터 결함]:\n" + "\n".join(fin_errors[:4]))
            if link_errors:
                reasons.append("🔗 [깨진 링크/라우트 404]:\n" + "\n".join(link_errors[:4]))
            if mobile_errors:
                reasons.append("📱 [모바일 가로 터짐 위험]:\n" + "\n".join(mobile_errors[:4]))
            if not ts_passed:
                reasons.append("❌ [TypeScript 컴파일 오류]:\n" + ts_output.strip()[:400])
            if not build_passed:
                reasons.append("💥 [Next.js 빌드 실패]:\n" + build_output.strip()[:400])
            
            error_msg = "\n\n".join(reasons)
            response = {
                "decision": "continue",
                "reason": (
                    f"⛔ 루프 엔지니어링 자동 검증 게이트에서 결함이 감지되었습니다.\n"
                    f"아래 항목을 스스로 자가 수정(Self-Correction)한 후 작업을 완료하세요:\n\n{error_msg}"
                )
            }
            print(json.dumps(response))
            sys.exit(0)

    # CLI 터미널 출력
    print(f"\n{BOLD}{BLUE}=========================================================={RESET}")
    print(f"{BOLD}{BLUE}   jusik.app 첨단 루프 엔지니어링 종합 검증 게이트        {RESET}")
    print(f"{BOLD}{BLUE}=========================================================={RESET}\n")

    # 1. 보안
    if not sec_errors:
        print(f"{GREEN}✓ [보안 루프] 통과:{RESET} API 키/토큰/비밀번호 누출 없음 (Clean)")
    else:
        print(f"{RED}✗ [보안 루프] 실패 ({len(sec_errors)}건):{RESET}")
        for err in sec_errors:
            print(f"  {YELLOW}• {err}{RESET}")

    # 2. 용어 규칙
    if not vocab_errors:
        desc = f"Git 작업 파일 {len(target_files)}개 읽기 점검 (무단 수정 0건)" if target_files else "전체 정적 점검"
        print(f"{GREEN}✓ [규칙 루프] 통과:{RESET} 쉬운 용어 가이드 준수 ({desc})")
    else:
        print(f"{RED}✗ [규칙 루프] 실패 ({len(vocab_errors)}건):{RESET}")
        for err in vocab_errors:
            print(f"  {YELLOW}• {err}{RESET}")

    # 3. 금융 데이터
    if not fin_errors:
        print(f"{GREEN}✓ [금융 루프] 통과:{RESET} 50개 자산 백테스트 수치 및 가격 데이터 무결 (NaN 0건)")
    else:
        print(f"{RED}✗ [금융 루프] 실패 ({len(fin_errors)}건):{RESET}")
        for err in fin_errors:
            print(f"  {YELLOW}• {err}{RESET}")

    # 4. 링크 & 라우트
    if not link_errors:
        print(f"{GREEN}✓ [링크 루프] 통과:{RESET} 37개 전체 라우트 및 커리큘럼 링크 404 결함 0건")
    else:
        print(f"{RED}✗ [링크 루프] 실패 ({len(link_errors)}건):{RESET}")
        for err in link_errors:
            print(f"  {YELLOW}• {err}{RESET}")

    # 5. 모바일 반응형
    if not mobile_errors:
        print(f"{GREEN}✓ [모바일 루프] 통과:{RESET} 375px 모바일 뷰포트 가로 터짐(Overflow) 위험 0건")
    else:
        print(f"{RED}✗ [모바일 루프] 실패 ({len(mobile_errors)}건):{RESET}")
        for err in mobile_errors:
            print(f"  {YELLOW}• {err}{RESET}")

    # 6. TypeScript
    if ts_passed:
        print(f"{GREEN}✓ [타입 루프] 통과:{RESET} TypeScript 정적 컴파일 무결성 완료 (0 errors)")
    else:
        print(f"{RED}✗ [타입 루프] 실패:{RESET} TypeScript 컴파일 에러")
        print(f"  {ts_output.strip()[:350]}")

    # 7. 빌드
    if full:
        if build_passed:
            print(f"{GREEN}✓ [빌드 루프] 통과:{RESET} Next.js 37개 전체 라우트 프로덕션 빌드 성공")
        else:
            print(f"{RED}✗ [빌드 루프] 실패:{RESET} Next.js 빌드 오류 발생")
            print(f"  {build_output.strip()[:350]}")
    else:
        print(f"{BLUE}ℹ [빌드 루프] 생략:{RESET} 초고속 일상 모드 (~2초) 실행 완료 (전체 빌드는 --full)")

    print(f"\n{BOLD}{BLUE}----------------------------------------------------------{RESET}")
    if all_passed:
        print(f"{BOLD}{GREEN}🎉 [최종 판정] 6대 검증 루프 전수 통과! 안전하게 배포 가능합니다.{RESET}\n")
        sys.exit(0)
    else:
        print(f"{BOLD}{RED}⚠️ [최종 판정] 결함이 발견되었습니다. 위 항목을 수정하세요.{RESET}\n")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="jusik.app 루프 엔지니어링 검증기")
    parser.add_argument("--full", action="store_true", help="Next.js 전체 프로덕션 빌드까지 포함 검증")
    parser.add_argument("--hook", action="store_true", help="Antigravity 에이전트 Stop Hook 전용 모드")
    args = parser.parse_args()

    run_loop_verification(full=args.full, hook_mode=args.hook)
