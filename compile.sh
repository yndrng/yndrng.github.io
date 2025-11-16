#!/bin/zsh

echo "compiling pdf..."
pandoc -f gfm cv.md --css style.css --pdf-engine=weasyprint -o cv.pdf


echo "compiling html page..."
pandoc --standalone --template template.html cv.md -o index.html

echo "completed"