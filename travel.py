"""Compile countries.json + world.geojson + cities.csv into travel.md (an inline SVG
world map, visited countries and cities filled in), consumed by map.js at runtime."""

import csv
import json
import math
from pathlib import Path

GEOJSON = Path(__file__).parent / "world.geojson"
CITIES_CSV = Path(__file__).parent / "cities.csv"
COUNTRIES_JSON = Path(__file__).parent / "countries.json"
TARGET = Path(__file__).parent / "travel.md"

HEADER = "---\ntitle: Travel\n---\n\n"

# Natural Earth stores ISO_A2 = "-99" for a handful of countries; ISO_A2_EH covers most
# of them. Anything still unresolved (disputed territories with no ISO 3166-1 code) is
# simply never matchable from countries.json, which is correct.
SKIP_NAMES = {"Antarctica"}

# Equal Earth projection constants (Šavrič et al. 2018).
A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796


def equal_earth(lon, lat):
    lam = math.radians(lon)
    phi = math.radians(lat)
    t = math.asin(math.sqrt(3) / 2 * math.sin(phi))
    t2, t4, t6 = t * t, t ** 4, t ** 6
    x = (2 * math.sqrt(3) * lam * math.cos(t)) / (
        3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1)
    )
    y = A4 * t6 * t2 * t + A3 * t6 * t + A2 * t2 * t + A1 * t
    # Flip y and scale up so coordinates are pleasant SVG units, not radians.
    return round(x * 200, 1), round(-y * 200, 1)


def project_ring(ring):
    return " ".join(f"{x},{y}" for x, y in (equal_earth(lon, lat) for lon, lat in ring))


def ring_to_path(ring):
    pts = list(equal_earth(lon, lat) for lon, lat in ring)
    d = f"M{pts[0][0]},{pts[0][1]}"
    d += "".join(f"L{x},{y}" for x, y in pts[1:])
    return d + "Z"


def geometry_to_path(geometry):
    gtype = geometry["type"]
    if gtype == "Polygon":
        rings = geometry["coordinates"]
    elif gtype == "MultiPolygon":
        rings = [ring for polygon in geometry["coordinates"] for ring in polygon]
    else:
        return ""
    return "".join(ring_to_path(ring) for ring in rings)


def country_code(props):
    for key in ("ISO_A2", "ISO_A2_EH"):
        value = props.get(key)
        if value and value != "-99":
            return value
    return None


def _ring_bbox(ring):
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return min(xs), min(ys), max(xs), max(ys)


def reassign_crimea(data):
    """Natural Earth's 110m dataset draws Crimea as a detached ring inside
    Russia's MultiPolygon, reflecting the post-2014 de facto occupation.
    Crimea is internationally recognized as Ukrainian territory (UN General
    Assembly Resolution 68/262), so move that ring into Ukraine's geometry
    here, before paths are built, so it is colored by Ukraine's visited
    status rather than Russia's."""
    russia = next((f for f in data["features"] if f["properties"].get("NAME") == "Russia"), None)
    ukraine = next((f for f in data["features"] if f["properties"].get("NAME") == "Ukraine"), None)
    if not russia or not ukraine:
        print("  warning: could not find Russia/Ukraine features to reassign Crimea")
        return

    polys = russia["geometry"]["coordinates"]
    crimea_idx = None
    for i, poly in enumerate(polys):
        minx, miny, maxx, maxy = _ring_bbox(poly[0])
        # Crimea's known extent (lon ~32.4-36.7, lat ~44.3-46.2) is distinct from
        # mainland Russia and from any other Russian exclave (e.g. Kaliningrad).
        if 31 <= minx <= 38 and 43 <= miny <= 47 and maxx <= 38:
            crimea_idx = i
            break

    if crimea_idx is None:
        print("  warning: could not locate Crimea inside Russia's geometry -- "
              "map may show it as Russian territory")
        return

    crimea_poly = polys.pop(crimea_idx)
    if ukraine["geometry"]["type"] == "Polygon":
        ukraine["geometry"] = {
            "type": "MultiPolygon",
            "coordinates": [ukraine["geometry"]["coordinates"], crimea_poly],
        }
    else:
        ukraine["geometry"]["coordinates"].append(crimea_poly)


def load_countries():
    with GEOJSON.open(encoding="utf-8") as handle:
        data = json.load(handle)
    reassign_crimea(data)
    features = {}
    bounds = [math.inf, math.inf, -math.inf, -math.inf]  # minx, miny, maxx, maxy
    for feature in data["features"]:
        props = feature["properties"]
        name = props.get("NAME")
        if name in SKIP_NAMES:
            continue
        path = geometry_to_path(feature["geometry"])
        if not path:
            continue
        code = country_code(props)
        features[id(feature)] = {"name": name, "code": code, "path": path}
        for x, y in re_extract_points(path):
            bounds[0] = min(bounds[0], x)
            bounds[1] = min(bounds[1], y)
            bounds[2] = max(bounds[2], x)
            bounds[3] = max(bounds[3], y)
    return list(features.values()), bounds


def re_extract_points(path):
    # Path is built only from M/L commands with "x,y" pairs — cheap to re-parse for
    # bounds rather than threading coordinate lists through separately.
    for token in path.replace("M", " ").replace("L", " ").replace("Z", "").split():
        x, y = token.split(",")
        yield float(x), float(y)


def load_cities_index():
    index = {}
    with CITIES_CSV.open(encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            cc = row["country_code"]
            index.setdefault(cc, []).append(row)
    return index


def find_city(cities_by_cc, cc, name):
    candidates = cities_by_cc.get(cc, [])
    name_lower = name.strip().lower()
    matches = [
        c for c in candidates
        if c["name"].lower() == name_lower or c["asciiname"].lower() == name_lower
    ]
    if not matches:
        return None
    return max(matches, key=lambda c: int(c["population"] or 0))


def normalize_city(entry):
    if isinstance(entry, str):
        return {"name": entry}
    return entry


def esc(value):
    return (
        str(value)
        .replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def years_label(years):
    if not years:
        return ""
    return ", ".join(str(y) for y in years)


def build_svg(features, bounds, visited_by_code, cities_by_cc):
    minx, miny, maxx, maxy = bounds
    pad = 4
    width = maxx - minx + pad * 2
    height = maxy - miny + pad * 2
    view_box = f"{minx - pad:.1f} {miny - pad:.1f} {width:.1f} {height:.1f}"

    parts = [f'<svg class="worldmap" viewBox="{view_box}" role="img" tabindex="0" '
             f'aria-label="World map of visited countries. Use the mouse wheel or '
             f'pinch to zoom, drag to pan, or arrow and +/- keys once focused.">']

    matched_codes = set()
    for feature in features:
        code = feature["code"]
        info = visited_by_code.get(code) if code else None
        classes = "country"
        attrs = f'd="{feature["path"]}" class="{classes}"'
        if info:
            matched_codes.add(code)
            classes += " visited"
            attrs = (
                f'd="{feature["path"]}" class="{classes}" tabindex="0" '
                f'data-name="{esc(feature["name"])}" '
                f'data-years="{esc(years_label(info.get("years")))}" '
                f'data-note="{esc(info.get("note", ""))}"'
            )
            title = feature["name"]
            extra = years_label(info.get("years"))
            if extra:
                title += f" — {extra}"
            if info.get("note"):
                title += f" · {info['note']}"
            parts.append(f'<path {attrs}><title>{esc(title)}</title></path>')
        else:
            parts.append(
                f'<path d="{feature["path"]}" class="{classes}" '
                f'aria-label="{esc(feature["name"])}"><title>{esc(feature["name"])}'
                f'</title></path>'
            )

    city_count = 0
    for code, info in visited_by_code.items():
        if code not in matched_codes:
            print(f"  warning: country code '{code}' in countries.json did not match "
                  f"any map geometry")
        for raw_city in info.get("cities", []):
            city = normalize_city(raw_city)
            name = city.get("name", "")
            lat, lon = city.get("lat"), city.get("lon")
            if lat is None or lon is None:
                match = find_city(cities_by_cc, code, name)
                if not match:
                    print(f"  warning: city '{name}' ({code}) not found in cities.csv "
                          f"— add lat/lon manually in countries.json")
                    continue
                lat, lon = float(match["lat"]), float(match["lon"])
            x, y = equal_earth(lon, lat)
            title = name
            extra = years_label(city.get("years"))
            if extra:
                title += f" — {extra}"
            if city.get("note"):
                title += f" · {city['note']}"
            parts.append(
                f'<circle class="city" cx="{x}" cy="{y}" r="2" tabindex="0" '
                f'data-name="{esc(name)}" data-years="{esc(extra)}" '
                f'data-note="{esc(city.get("note", ""))}">'
                f'<title>{esc(title)}</title></circle>'
            )
            city_count += 1

    parts.append("</svg>")
    return "\n".join(parts), len(matched_codes), city_count


def main():
    with COUNTRIES_JSON.open(encoding="utf-8") as handle:
        countries = json.load(handle)
    visited_by_code = {c["code"]: c for c in countries}

    features, bounds = load_countries()
    cities_by_cc = load_cities_index()

    svg, n_countries, n_cities = build_svg(features, bounds, visited_by_code, cities_by_cc)

    body = (
        f"{svg}\n\n"
        f'<p class="map-count">{n_countries} '
        f'{"country" if n_countries == 1 else "countries"} · '
        f'{n_cities} {"city" if n_cities == 1 else "cities"}</p>\n'
        f'<p class="map-reset"><a href="#" id="map-reset">Reset view</a></p>\n'
        f'<div id="map-tip" class="map-tip" hidden></div>\n'
    )

    TARGET.write_text(HEADER + body, encoding="utf-8")
    print(f"wrote {TARGET.name} ({n_countries} countries, {n_cities} cities)")


if __name__ == "__main__":
    main()
