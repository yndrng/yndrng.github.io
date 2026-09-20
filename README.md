# Super Simple CV

A static site served via GitHub Pages:

* **CV** — `cv.md` compiled into `cv.html` (with a link to the generated `cv.pdf`).
* **Gigs** — `gigs.csv` compiled into `gigs.html`, a table of gigs attended, newest first.
* **Travel** — `countries.json` compiled into `travel.html`, an interactive world map of
  visited countries and cities.

`index.html` is a redirect to `cv.html`.

[You can view my CV online as an example.](https://yndrng.github.io/)

## Quick Start

You must have pandoc installed, along with LaTeX, wkhtmltopdf, and Python 3.

* Clone the repository and edit the cv.md file with your own information.
* run the `compile.sh` script to generate the PDF and both html pages.

## Adding a gig

Append a row to `gigs.csv` (any order — the page sorts by date, newest first) and re-run
`./compile.sh`:

```csv
artist,date,venue,location
Nine Inch Nails,2024-06-14,Progresja,"Warsaw, Poland"
```

Dates may be written as `YYYY-MM-DD`, `DD.MM.YYYY`, or `DD/MM/YYYY`; they render as `14 Jun 2024`. `gigs.py` turns the CSV into
`gigs.md` (an intermediate file, git-ignored), which pandoc renders into `gigs.html`.

## Adding a country or city to the map

Edit `countries.json`:

```json
{ "code": "FR", "name": "France", "years": [2019, 2024], "note": "",
  "cities": [
    "Paris",
    { "name": "Lyon", "years": [2024], "note": "Layover" }
  ]
}
```

`code` is the only required field (ISO 3166-1 alpha-2). A city is either a plain name
string, or an object with optional `years` / `note`, plus optional `lat` / `lon` to
override the automatic lookup (needed for very small towns, or anything renamed/disputed
enough to be missing from the city list). Then re-run `./compile.sh` — it prints a
warning naming any country code or city name it couldn't match, so a typo shows up
immediately instead of silently vanishing from the map.

`travel.py` projects `world.geojson` (Natural Earth, 1:110m admin-0 countries, public
domain) and `cities.csv` (trimmed from [GeoNames](https://www.geonames.org/) `cities15000`,
CC BY 4.0) into a single inline SVG in `travel.md`, which pandoc renders into
`travel.html`. `map.js` layers pan/zoom, tooltips and click-to-focus on top in the
browser; with JavaScript disabled the map still renders fully coloured with native
tooltips, just without the interactivity.
