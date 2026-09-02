#!/bin/zsh

echo "compiling pdf..."
pandoc -f gfm cv.md --css style.css --pdf-engine=weasyprint -o cv.pdf

echo "compiling cv page..."
pandoc --standalone --template template.html --metadata cvpage=true cv.md -o cv.html

echo "compiling gigs page..."
python3 gigs.py
pandoc -f gfm --standalone --template template.html --metadata gigspage=true gigs.md -o gigs.html

echo "completed"
