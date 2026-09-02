# Super Simple CV

A two-tab static site served via GitHub Pages:

* **CV** — `cv.md` compiled into `cv.html` (with a link to the generated `cv.pdf`).
* **Gigs** — `gigs.csv` compiled into `gigs.html`, a table of gigs attended, newest first.

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
