#!/usr/bin/env python3
"""Sync contributor Markdown profiles and 360x360 JPEG headshots from the Google Sheet.

Reads `Form responses 1` via `gsheets` CLI (or a pre-exported JSON snapshot via --input),
respects consent flags, normalizes URLs/names, preserves existing hand-edited fields when
sheet cells are blank, downloads Google Drive headshots/logos, crops/pads them to
360x360 baseline JPEGs, and writes Hugo contributor entries under content/en/contributors/.
"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import subprocess
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image, ImageOps

DEFAULT_SHEET_ID = "1o4ib4IGB2jyBwtIYK1O0aapL2QYkihVgXngL5KekUpM"
PROFILE_CONSENT_PREFIX = "Please include my name, photo and profile"
ORG_CONSENT_PREFIX = "Please list my organisation as a supporter"
TARGET_SIZE = (360, 360)

PLACEHOLDER_VALUES = {"", "n/a", "na", "none", "-", "--"}


def find_repo_root() -> Path:
    here = Path(__file__).resolve()
    for candidate in [here.parent, *here.parents]:
        if (candidate / "config.yaml").exists() and (candidate / "content").exists():
            return candidate
    return Path.cwd()


def slugify(text: str) -> str:
    norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    norm = norm.lower().strip()
    norm = re.sub(r"[^a-z0-9]+", "-", norm)
    return norm.strip("-")


def normalize_name_case(name: str) -> str:
    """Fix lowercase surname parts like 'Marcelle chagas' without mangling acronyms."""
    words = name.strip().split()
    fixed: list[str] = []
    for word in words:
        if word.islower() and len(word) > 1:
            fixed.append(word.capitalize())
        else:
            fixed.append(word)
    return " ".join(fixed)


def strip_markdown_link(raw: str) -> str:
    val = (raw or "").strip()
    m = re.match(r"^\[([^\]]*)\]\(([^)]+)\)$", val)
    if m:
        return m.group(2).strip()
    return val


def clean_text(raw: str) -> str:
    val = (raw or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if val.lower() in PLACEHOLDER_VALUES:
        return ""
    return val


def clean_org(raw: str) -> str:
    val = clean_text(raw)
    if not val:
        return ""
    val = re.sub(r"^N/?A\s*\(([^)]+)\)$", r"\1", val, flags=re.IGNORECASE).strip()
    if val.lower() in PLACEHOLDER_VALUES:
        return ""
    return val


def normalize_url(raw: str) -> str:
    val = clean_text(strip_markdown_link(raw))
    if not val or val.lower() in PLACEHOLDER_VALUES:
        return ""

    # Bare domain without scheme
    if re.match(r"^www\.[a-z0-9.-]+\.[a-z]{2,}", val, re.IGNORECASE):
        val = "https://" + val
    elif val.startswith("http://www."):
        # Google Sheets auto-prepends http:// when users enter bare www.* domains
        val = "https://" + val[len("http://") :]

    if not re.match(r"^https?://", val, re.IGNORECASE):
        return ""

    parsed = urllib.parse.urlsplit(val)
    host = parsed.netloc.lower()
    if "linkedin.com" in host:
        query_pairs = [
            (k, v)
            for k, v in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
            if not k.lower().startswith("utm_")
        ]
        new_query = urllib.parse.urlencode(query_pairs)
        scheme = "https" if parsed.scheme == "http" else parsed.scheme
        val = urllib.parse.urlunsplit((scheme, parsed.netloc, parsed.path, new_query, parsed.fragment))

    return val


def normalize_microblog(raw: str, existing: str = "") -> str:
    val = clean_text(strip_markdown_link(raw))
    if not val:
        return existing
    if val.startswith("@"):
        handle = val[1:].strip()
        if ".bsky.social" in handle.lower():
            return f"https://bsky.app/profile/{handle}"
        if existing and handle.lower() in existing.lower():
            return existing
        return existing or ""
    url = normalize_url(val)
    return url or existing


def is_linkedin_url(url: str) -> bool:
    return "linkedin.com/" in (url or "").lower()


def is_linkedin_personal_url(url: str) -> bool:
    return "linkedin.com/in/" in (url or "").lower()


def extract_drive_id(raw: str) -> str:
    val = strip_markdown_link(raw)
    if not val:
        return ""
    for pat in (
        r"[?&]id=([A-Za-z0-9_-]+)",
        r"/file/d/([A-Za-z0-9_-]+)",
        r"/open\?id=([A-Za-z0-9_-]+)",
    ):
        m = re.search(pat, val)
        if m:
            return m.group(1)
    return ""


def load_sheet_rows(sheet_id: str, input_path: str | None) -> list[list[str]]:
    if input_path:
        raw_text = Path(input_path).read_text(encoding="utf-8")
    else:
        proc = subprocess.run(
            ["gsheets", "readonly", "read-all", sheet_id, "--markdown-links", "--json"],
            capture_output=True,
            text=True,
            check=True,
        )
        raw_text = proc.stdout

    # `gsheets readonly read-all` prints a `--- <Tab Name> ---` header before the JSON array.
    idx = raw_text.find("[")
    if idx == -1:
        raise RuntimeError("Could not locate JSON array in gsheets output.")
    rows = json.loads(raw_text[idx:])
    if not isinstance(rows, list) or not rows:
        raise RuntimeError("Spreadsheet returned no rows.")
    return rows


def parse_existing_front_matter(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n([\s\S]*?)\n---", text)
    if not m:
        return {}
    result: dict[str, Any] = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        kv = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if not kv:
            continue
        key, raw_val = kv.group(1), kv.group(2).strip()
        if raw_val.startswith('"') and raw_val.endswith('"'):
            try:
                val: Any = json.loads(raw_val)
            except json.JSONDecodeError:
                val = raw_val[1:-1]
        elif raw_val.startswith("'") and raw_val.endswith("'"):
            val = raw_val[1:-1].replace("''", "'")
        elif raw_val in ("true", "false"):
            val = raw_val == "true"
        elif re.fullmatch(r"-?\d+", raw_val):
            val = int(raw_val)
        else:
            val = raw_val
        result[key] = val
    return result


def format_yaml_value(key: str, val: Any) -> str:
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, int):
        return str(val)
    s = str(val or "")
    if key == "headshot" and s:
        return json.dumps(s, ensure_ascii=False)
    if s == "":
        return '""'
    needs_quotes = (
        any(ch in s for ch in (":", "#", '"', "\n"))
        or s.startswith(("'", "[", "{", "@", "*", "&", "!", "%", "-", "?"))
        or s in ("true", "false", "null", "yes", "no")
    )
    if needs_quotes:
        return json.dumps(s, ensure_ascii=False)
    return s


def write_contributor_markdown(path: Path, data: dict[str, Any], dry_run: bool = False) -> None:
    order = [
        "title",
        "organisation",
        "role",
        "bio",
        "profile_url",
        "linkedin_url",
        "microblog_url",
        "headshot",
        "order_weight",
        "draft",
    ]
    lines = ["---"]
    for key in order:
        if key not in data:
            continue
        if key == "headshot" and not data[key]:
            continue
        lines.append(f"{key}: {format_yaml_value(key, data[key])}")
    for key, val in data.items():
        if key not in order:
            lines.append(f"{key}: {format_yaml_value(key, val)}")
    lines.append("---")
    content = "\n".join(lines) + "\n"
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def download_and_resize_image(drive_id: str, dest_path: Path, pad_logo: bool = False) -> tuple[bool, str]:
    urls = [
        f"https://drive.usercontent.google.com/download?id={drive_id}&export=download",
        f"https://drive.google.com/uc?export=download&id={drive_id}",
    ]
    raw_bytes = b""
    last_err = ""
    for url in urls:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                ctype = (resp.headers.get("Content-Type") or "").lower()
                if not ctype.startswith("image/"):
                    last_err = f"Non-image Content-Type ({ctype}) from {url}"
                    continue
                raw_bytes = resp.read()
                if raw_bytes:
                    break
        except Exception as exc:  # noqa: BLE001
            last_err = str(exc)

    if not raw_bytes:
        return False, last_err or "Empty download"

    img = Image.open(io.BytesIO(raw_bytes))
    img = ImageOps.exif_transpose(img)

    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        rgba = img.convert("RGBA")
        canvas = Image.new("RGB", rgba.size, (255, 255, 255))
        canvas.paste(rgba, mask=rgba.split()[3])
        img = canvas
    else:
        img = img.convert("RGB")

    if pad_logo:
        processed = ImageOps.pad(img, TARGET_SIZE, method=Image.Resampling.LANCZOS, color=(255, 255, 255))
    else:
        processed = ImageOps.fit(
            img, TARGET_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.25)
        )

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    processed.save(dest_path, format="JPEG", quality=85, optimize=True, progressive=False)
    return True, f"Saved {TARGET_SIZE[0]}x{TARGET_SIZE[1]} JPEG ({dest_path.stat().st_size} bytes)"


def build_col_index(header: list[str]) -> dict[str, int]:
    return {h.strip(): idx for idx, h in enumerate(header)}


def get_cell(row: list[str], col_idx: dict[str, int], col_name: str) -> str:
    idx = col_idx.get(col_name)
    if idx is None or idx >= len(row):
        return ""
    return row[idx] or ""


def group_sheet_entries(rows: list[list[str]]) -> list[dict[str, Any]]:
    header = rows[0]
    col_idx = build_col_index(header)
    by_email: dict[str, list[dict[str, str]]] = {}

    for row in rows[1:]:
        email = clean_text(get_cell(row, col_idx, "Email address")).lower()
        name = clean_text(get_cell(row, col_idx, "Your name"))
        if not email and not name:
            continue
        key = email or slugify(name)
        record = {
            "timestamp": clean_text(get_cell(row, col_idx, "Timestamp")),
            "email": email,
            "roles_note": clean_text(get_cell(row, col_idx, "Your role(s)")),
            "involvement": clean_text(get_cell(row, col_idx, "How do you want to get involved")),
            "name": name,
            "bio": clean_text(get_cell(row, col_idx, "One line biography")),
            "profile_url": get_cell(row, col_idx, "Profile URL"),
            "headshot": get_cell(row, col_idx, "Headshot"),
            "linkedin_url": get_cell(row, col_idx, "LinkedIn URL"),
            "microblog_url": get_cell(row, col_idx, "Bluesky / Mastodon / Other microblogging URL"),
            "other_social": get_cell(row, col_idx, "Other social media handles (platform/handle)"),
            "organisation": get_cell(row, col_idx, "Your organisation"),
            "role": clean_text(get_cell(row, col_idx, "Your role")),
            "org_website": get_cell(row, col_idx, "Organisation website address"),
            "org_logo": get_cell(row, col_idx, "Organisation or project logo"),
        }
        by_email.setdefault(key, []).append(record)

    merged_entries: list[dict[str, Any]] = []
    for _email, group in by_email.items():
        has_profile_consent = any(PROFILE_CONSENT_PREFIX in r["involvement"] for r in group)
        has_org_consent = any(ORG_CONSENT_PREFIX in r["involvement"] for r in group)
        if not has_profile_consent and not has_org_consent:
            continue

        is_org_only = not has_profile_consent and has_org_consent
        merged: dict[str, Any] = {
            "is_org_entry": is_org_only,
            "title": "",
            "organisation": "",
            "role": "",
            "bio": "",
            "profile_url": "",
            "linkedin_url": "",
            "microblog_url": "",
            "drive_id": "",
        }

        for r in group:
            org = clean_org(r["organisation"])
            if org:
                merged["organisation"] = org

            if is_org_only:
                if org:
                    merged["title"] = org
                elif r["name"]:
                    merged["title"] = normalize_name_case(r["name"])
            else:
                if r["name"]:
                    merged["title"] = normalize_name_case(r["name"])

            if r["role"]:
                merged["role"] = r["role"]
            if r["bio"]:
                merged["bio"] = r["bio"]

            prof = normalize_url(r["profile_url"])
            org_web = normalize_url(r["org_website"])
            li = normalize_url(r["linkedin_url"])

            if prof and not is_linkedin_url(prof):
                merged["profile_url"] = prof
            elif org_web and not is_linkedin_url(org_web):
                merged["profile_url"] = org_web
            elif prof and not li and not merged["linkedin_url"] and not merged["profile_url"]:
                merged["profile_url"] = prof

            if li:
                if is_linkedin_personal_url(li) or not is_linkedin_personal_url(merged["linkedin_url"]):
                    merged["linkedin_url"] = li

            if r["microblog_url"]:
                merged["microblog_url"] = normalize_microblog(r["microblog_url"], merged["microblog_url"])
            elif r["other_social"]:
                merged["microblog_url"] = normalize_microblog(r["other_social"], merged["microblog_url"])

            if is_org_only:
                d_id = extract_drive_id(r["org_logo"]) or extract_drive_id(r["headshot"])
            else:
                d_id = extract_drive_id(r["headshot"])
            if d_id:
                merged["drive_id"] = d_id

        if not merged["title"]:
            continue
        merged["slug"] = slugify(merged["title"])
        merged_entries.append(merged)

    return merged_entries


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync contributors from Google Sheet to Hugo content + 360x360 JPEGs.")
    parser.add_argument("--sheet-id", default=DEFAULT_SHEET_ID, help="Google Spreadsheet ID")
    parser.add_argument("--input", help="Path to pre-exported JSON from gsheets read-all --markdown-links --json")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing files")
    parser.add_argument("--skip-images", action="store_true", help="Skip downloading/updating images")
    parser.add_argument("--refresh-images", action="store_true", help="Re-download images even if file already exists")
    parser.add_argument("--refresh-slugs", default="", help="Comma-separated slugs whose images should be re-downloaded")
    args = parser.parse_args()

    repo_root = find_repo_root()
    contrib_dir = repo_root / "content" / "en" / "contributors"
    images_dir = repo_root / "static" / "images" / "contributors"
    refresh_slugs = {s.strip() for s in args.refresh_slugs.split(",") if s.strip()}

    rows = load_sheet_rows(args.sheet_id, args.input)
    entries = group_sheet_entries(rows)

    existing_by_slug: dict[str, dict[str, Any]] = {}
    used_weights: set[int] = set()
    for md_path in sorted(contrib_dir.glob("*.md")):
        slug = md_path.stem
        fm = parse_existing_front_matter(md_path)
        existing_by_slug[slug] = fm
        if slug != "z_many-more" and isinstance(fm.get("order_weight"), int):
            used_weights.add(fm["order_weight"])

    next_weight = ((max(used_weights) // 10) + 1) * 10 if used_weights else 10
    summary = {"created": [], "updated": [], "unchanged": [], "images": [], "image_errors": []}

    for entry in entries:
        slug = entry["slug"]
        md_path = contrib_dir / f"{slug}.md"
        existing = existing_by_slug.get(slug, {})
        is_new = slug not in existing_by_slug

        # Assign order_weight preserving existing values and placing Nico in slot 30 if free
        if isinstance(existing.get("order_weight"), int):
            order_weight = existing["order_weight"]
        elif slug == "nico-f-fioretti" and 30 not in used_weights:
            order_weight = 30
            used_weights.add(30)
        else:
            while next_weight in used_weights:
                next_weight += 10
            order_weight = next_weight
            used_weights.add(order_weight)
            next_weight += 10

        img_path = images_dir / f"{slug}.jpg"
        need_download = (
            not args.skip_images
            and bool(entry["drive_id"])
            and (args.refresh_images or slug in refresh_slugs or not img_path.exists())
        )
        if need_download:
            if args.dry_run:
                summary["images"].append({"slug": slug, "drive_id": entry["drive_id"], "status": "would_download"})
            else:
                ok, msg = download_and_resize_image(entry["drive_id"], img_path, pad_logo=entry["is_org_entry"])
                if ok:
                    summary["images"].append({"slug": slug, "drive_id": entry["drive_id"], "status": msg})
                else:
                    summary["image_errors"].append({"slug": slug, "drive_id": entry["drive_id"], "error": msg})

        headshot_val = existing.get("headshot", "")
        if img_path.exists():
            headshot_val = f"/images/contributors/{slug}.jpg"

        merged_fm = {
            "title": entry["title"] or existing.get("title", ""),
            "organisation": entry["organisation"] or existing.get("organisation", ""),
            "role": entry["role"] or existing.get("role", ""),
            "bio": entry["bio"] or existing.get("bio", ""),
            "profile_url": entry["profile_url"] or existing.get("profile_url", ""),
            "linkedin_url": entry["linkedin_url"] or existing.get("linkedin_url", ""),
            "microblog_url": entry["microblog_url"] or existing.get("microblog_url", ""),
            "headshot": headshot_val,
            "order_weight": order_weight,
            "draft": existing.get("draft", False),
        }

        if not is_new and existing == merged_fm:
            summary["unchanged"].append(slug)
        else:
            write_contributor_markdown(md_path, merged_fm, dry_run=args.dry_run)
            (summary["created"] if is_new else summary["updated"]).append(slug)

    # Keep z_many-more.md last
    many_more_path = contrib_dir / "z_many-more.md"
    if many_more_path.exists():
        mm = parse_existing_front_matter(many_more_path)
        max_w = max(used_weights) if used_weights else 90
        if isinstance(mm.get("order_weight"), int) and mm["order_weight"] <= max_w:
            mm["order_weight"] = 999
            write_contributor_markdown(many_more_path, mm, dry_run=args.dry_run)
            summary["updated"].append("z_many-more")

    print(json.dumps(summary, indent=2))
    return 1 if summary["image_errors"] else 0


if __name__ == "__main__":
    sys.exit(main())

