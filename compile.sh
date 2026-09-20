#!/bin/zsh

echo "compiling pdf..."
pandoc -f gfm cv.md --css style.css --pdf-engine=weasyprint -o cv.pdf

echo "compiling cv page..."
pandoc --standalone --template template.html --metadata cvpage=true cv.md -o cv.html

echo "compiling gigs page..."
python3 gigs.py
pandoc -f gfm --standalone --template template.html --metadata gigspage=true gigs.md -o gigs.html

echo "compiling travel page..."
python3 travel.py
pandoc -f gfm --standalone --template template.html --metadata travelpage=true travel.md -o travel.html

echo "completed"
