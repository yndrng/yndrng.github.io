"""Compile gigs.csv into gigs.md (a markdown table, newest gig first)."""

import csv
import re
from datetime import date, datetime
from pathlib import Path

SOURCE = Path(__file__).parent / "gigs.csv"
TARGET = Path(__file__).parent / "gigs.md"

HEADER = "---\ntitle: Gigs\n---\n\n"
COLUMNS = ("artist", "date", "venue", "city", "country")


FORMATS = ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y")


RANGE_SEPARATOR = re.compile(r"\s+[-–—]\s+|\s*[–—]\s*")


def parse_date(value):
    for fmt in FORMATS:
        try:
            return datetime.strptime((value or "").strip(), fmt).date()
        except ValueError:
            continue
    return date.min


def parse_range(value):
    """Return (start, end) for 'DD.MM.YYYY' or 'DD.MM.YYYY - DD.MM.YYYY'; end == start for a single day."""
    parts = RANGE_SEPARATOR.split((value or "").strip())
    start = parse_date(parts[0])
    end = parse_date(parts[1]) if len(parts) == 2 else start
    if end == date.min or end < start:
        end = start
    return start, end


def format_range(start, end):
    if end == start:
        return start.strftime("%d %b %Y")
    if (start.year, start.month) == (end.year, end.month):
        return f"{start.day}–{end.strftime('%d %b %Y')}"
    if start.year == end.year:
        return f"{start.strftime('%d %b')} – {end.strftime('%d %b %Y')}"
    return f"{start.strftime('%d %b %Y')} – {end.strftime('%d %b %Y')}"


def cell(value):
    return (value or "").strip().replace("|", r"\|")


def render_row(row):
    start, end = parse_range(row.get("date", ""))
    shown = format_range(start, end) if start != date.min else cell(row.get("date"))
    values = (cell(row.get("artist")), shown, cell(row.get("venue")), cell(row.get("city")), cell(row.get("country")))
    return "| " + " | ".join(values) + " |"


with SOURCE.open(newline="", encoding="utf-8") as handle:
    rows = [row for row in csv.DictReader(handle) if any((value or "").strip() for value in row.values())]

rows.sort(key=lambda row: parse_range(row.get("date", "")), reverse=True)

if rows:
    body = "\n".join(
        ["| Artist | Date | Venue | City | Country |", "|---|---|---|---|---|"] + [render_row(row) for row in rows]
    )
else:
    body = "*No gigs logged yet.*"

TARGET.write_text(HEADER + body + "\n", encoding="utf-8")
print(f"wrote {TARGET.name} ({len(rows)} gigs)")
