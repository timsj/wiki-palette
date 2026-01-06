# Wiki Palette

A web app that generates color palettes from Wikipedia article images.

Search for any Wikipedia article, and Wiki Palette [extracts the dominant colors](https://en.wikipedia.org/wiki/Color_quantization) from its lead image using a modified median cut quantization algorithm.

## Features

- **Wikipedia Search** — Search articles with keyboard navigation and autocomplete
- **Random Article** — Get inspired by a random Wikipedia article
- **Color Extraction** — Extracts 4 dominant colors from article images
- **Sort Options** — Sort palette by dominance (frequency) or luminance (brightness)
- **Copy Colors** — Click any color to copy its hex value

<br>
<p align="center">
    <img src="https://i.imgur.com/56UG1qA.png" width="50%" height="50%" alt="screenshot of app"/>
</p>

## How It Works

The color quantization is a TypeScript implementation of the [modified median cut algorithm](http://leptonica.org/papers/mediancut.pdf) from the [Leptonica](http://www.leptonica.org) library. It recursively partitions the color space to identify the most dominant colors in an image.

Colors can be sorted by:

- **Dominance** — How frequently the color appears in the image
- **Luminance** — Brightness using the W3C relative luminance formula
