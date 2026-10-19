#!/usr/bin/env python3
"""
jusik.app 실전 검증 엔진 (Substantive Verification & Unit Test Gate)
- 장식용 출력(토큰 낭비) 제거, 실제 유닛 테스트(scripts/test_engine.ts) + 보안 + 용어 + TypeScript 검증 수행
"""

import os
import sys
import re
import subprocess
import json
import argparse
from typing import List, Tuple

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_PATTERNS = [
    (r"\b[0-9]{9,10}:[a-zA-Z0-9_-]{35}\b", "Telegram Bot Token"),
    (r"\bAIza[0-9A-Za-z-_]{35}\b", "Google/Gemini API Key"),
    (r"\bsk-[a-zA-Z0-9]{20,}\b", "OpenAI API Key"),
    (r"\bsb_secret_[a-zA-Z0-9_-]+\b", "Supabase Secret Key"),
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "Private Key"),
]

FORBIDDEN_RULES = [
    (r"매수", "주식 구매 또는 구매"),
    (r"매도", "주식 판매 또는 팔기"),
    (r"주가", "주식 가격 또는 가격"),
    (r"시가총액", "회사 몸값 또는 회사 규모"),
    (r"\b([0-9]+)가지\b", "순우리말 수관형사 (한 가지, 두 가지, 세 가지 등)"),
]

EXCLUDED_TERM_FILES = {
    "src/data/termsQuizData.ts",
    "src/components/BasicTermsQuiz.tsx",
    "src/components/StockTradeMotionSimulator.tsx",
    "src/components/StockTradeGuide.tsx",
    "src/components/StockDcaMotionSimulator.tsx",
    "src/components/StockDcaGuide.tsx",
    "src/utils/aiSummary.ts",
    "src/components/CiscoManiaGame.tsx",
}


def get_git_modified_files() -> List[str]:
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        files = []
        for line in res.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            parts = line.split(maxsplit=1)
            if len(parts) == 2:
                files.append(parts[1].strip())
        return files
    except Exception:
        return []


def check_security(target_files: List[str] = None) -> List[str]:
    errors = []
    try:
        tracked = subprocess.run(
            ["git", "ls-files", ".env.local"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        if tracked.stdout.strip():
            errors.append("[보안 위반] .env.local 파일이 Git에 추적되고 있습니다.")
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
        if any(ign in rel_path for ign in [".git", "node_modules", ".next", ".gemini", ".data", "transcript"]):
            continue
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        if not os.path.isfile(full_path):
            continue
        try:
            with open(full_path, "r", encoding="utf-8", errors="ignore") as fp:
                for line_idx, line in enumerate(fp, 1):
                    for pat, desc in SECRET_PATTERNS:
                        if re.search(pat, line):
                            errors.append(f"[보안 위험] {rel_path}:{line_idx} - {desc} 노출 의심")
        except Exception:
            pass
    return errors


def check_vocabulary_rules(target_files: List[str] = None) -> List[str]:
    errors = []
    if target_files is not None:
        files_to_scan = [
            f for f in target_files
            if f.startswith("src/") and f.endswith((".ts", ".tsx")) and f not in EXCLUDED_TERM_FILES
        ]
    else:
        files_to_scan = []
        for root, _, filenames in os.walk(os.path.join(PROJECT_ROOT, "src")):
            for f in filenames:
                rel = os.path.relpath(os.path.join(root, f), PROJECT_ROOT)
                if rel not in EXCLUDED_TERM_FILES and f.endswith((".ts", ".tsx")):
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
                                f"[용어 위반] {rel_path}:{line_idx} '{matches[0].group()}' -> '{replacement}' 권장 ({stripped[:50]})"
                            )
        except Exception:
            pass
    return errors


def check_unit_tests() -> Tuple[bool, str]:
    try:
        res = subprocess.run(
            ["npx", "tsx", "scripts/test_engine.ts"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        if res.returncode == 0:
            return True, res.stdout.strip()
        return False, (res.stdout + "\n" + res.stderr).strip()
    except Exception as e:
        return False, str(e)


def check_typescript() -> Tuple[bool, str]:
    try:
        res = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        if res.returncode == 0:
            return True, ""
        return False, (res.stdout + res.stderr).strip()
    except Exception as e:
        return False, str(e)


def check_next_build() -> Tuple[bool, str]:
    try:
        res = subprocess.run(
            ["npm", "run", "build"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
        )
        if res.returncode == 0:
            return True, ""
        return False, (res.stdout + res.stderr).strip()
    except Exception as e:
        return False, str(e)


def run_loop_verification(full: bool = False, hook_mode: bool = False):
    modified_files = get_git_modified_files()
    target_files = modified_files if not full else None

    sec_errors = check_security(target_files)
    vocab_errors = check_vocabulary_rules(target_files)
    unit_passed, unit_output = check_unit_tests()
    ts_passed, ts_output = check_typescript()

    build_passed = True
    build_output = ""
    if full:
        build_passed, build_output = check_next_build()

    all_passed = (
        len(sec_errors) == 0
        and len(vocab_errors) == 0
        and unit_passed
        and ts_passed
        and build_passed
    )

    if hook_mode:
        if all_passed:
            print(json.dumps({}))
            sys.exit(0)
        reasons = []
        if sec_errors:
            reasons.append("🚨 [보안 위반]:\n" + "\n".join(sec_errors[:4]))
        if vocab_errors:
            reasons.append("⚠️ [용어 위반]:\n" + "\n".join(vocab_errors[:4]))
        if not unit_passed:
            reasons.append("🧪 [유닛 테스트 실패]:\n" + unit_output[:400])
        if not ts_passed:
            reasons.append("❌ [TypeScript 오류]:\n" + ts_output[:400])
        if not build_passed:
            reasons.append("💥 [Next.js 빌드 실패]:\n" + build_output[:400])

        print(
            json.dumps(
                {
                    "decision": "continue",
                    "reason": "검증 게이트 결함 감지. 즉시 수정하세요:\n\n" + "\n\n".join(reasons),
                }
            )
        )
        sys.exit(0)

    if all_passed:
        mode_label = "FULL+BUILD" if full else "FAST"
        print(f"[VERIFY PASS ({mode_label})] Security=OK | Vocab=OK | UnitTests={unit_output} | TSC=OK")
        sys.exit(0)

    print("[VERIFY FAIL]")
    for e in sec_errors:
        print(" -", e)
    for e in vocab_errors:
        print(" -", e)
    if not unit_passed:
        print(" - [Unit Test Error]:", unit_output[:500])
    if not ts_passed:
        print(" - [TSC Error]:", ts_output[:500])
    if not build_passed:
        print(" - [Build Error]:", build_output[:500])
    sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="jusik.app 검증 엔진")
    parser.add_argument("--full", action="store_true", help="Next.js 전체 빌드 포함")
    parser.add_argument("--hook", action="store_true", help="Stop Hook 모드")
    args = parser.parse_args()
    run_loop_verification(full=args.full, hook_mode=args.hook)
