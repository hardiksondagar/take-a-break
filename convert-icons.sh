#!/bin/bash

# Convert SVG icons to PNG format
# Requires ImageMagick: brew install imagemagick

echo "Converting SVG icons to PNG..."

if command -v convert &> /dev/null; then
    convert icons/icon16.svg icons/icon16.png
    convert icons/icon48.svg icons/icon48.png
    convert icons/icon128.svg icons/icon128.png
    echo "✓ Icons converted successfully!"
else
    echo "⚠️  ImageMagick not found. Install with: brew install imagemagick"
    echo "Or use an online converter like: https://cloudconvert.com/svg-to-png"
    echo ""
    echo "SVG files are ready at:"
    echo "  - icons/icon16.svg"
    echo "  - icons/icon48.svg"
    echo "  - icons/icon128.svg"
fi
