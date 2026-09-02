"""Compile gigs.csv into gigs.md (a markdown table, newest gig first)."""

import csv
from datetime import date, datetime
from pathlib import Path

SOURCE = Path(__file__).parent / "gigs.csv"
TARGET = Path(__file__).parent / "gigs.md"

HEADER = "---\ntitle: Gigs\n---\n\n"
COLUMNS = ("artist", "date", "venue", "location")


FORMATS = ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y")


def parse_date(value):
    for fmt in FORMATS:
        try:
            return datetime.strptime((value or "").strip(), fmt).date()
        except ValueError:
            continue
    return date.min


def cell(value):
    return (value or "").strip().replace("|", r"\|")


def render_row(row):
    parsed = parse_date(row.get("date", ""))
    shown = parsed.strftime("%d %b %Y") if parsed != date.min else cell(row.get("date"))
    values = (cell(row.get("artist")), shown, cell(row.get("venue")), cell(row.get("location")))
    return "| " + " | ".join(values) + " |"


with SOURCE.open(newline="", encoding="utf-8") as handle:
    rows = [row for row in csv.DictReader(handle) if any((value or "").strip() for value in row.values())]

rows.sort(key=lambda row: parse_date(row.get("date", "")), reverse=True)

if rows:
    body = "\n".join(
        ["| Artist | Date | Venue | Location |", "|---|---|---|---|"] + [render_row(row) for row in rows]
    )
else:
    body = "*No gigs logged yet.*"

TARGET.write_text(HEADER + body + "\n", encoding="utf-8")
print(f"wrote {TARGET.name} ({len(rows)} gigs)")
