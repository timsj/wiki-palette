# Wiki Palette

A web app that generates color palettes from Wikipedia article images.

Search for any Wikipedia article, and Wiki Palette [extracts the dominant colors](https://en.wikipedia.org/wiki/Color_quantization) from its lead image using an octree or modified median cut quantization algorithm.

<br>
<p align="center">
    <img src="https://i.imgur.com/56UG1qA.png" width="55%" height="55%" alt="screenshot of app"/>
</p>

## Features

- **Wikipedia Search** — Search articles with keyboard navigation and autocomplete
- **Random Article** — Get inspired by a random Wikipedia article
- **Color Extraction** — Extracts up to 4 dominant colors from article images
- **Sort Options** — Sort palette by dominance or relative luminance
- **Copy Colors** — Click any color to copy its hex value

## How It Works

The color quantization algorithms used are TypeScript implementations of the [octree](http://www.leptonica.org/papers/colorquant.pdf) and [modified median cut (MMC)](http://leptonica.org/papers/mediancut.pdf) methods. Octree incrementally groups color clusters into a hierarchical tree structure and prunes it based on color frequency, while MMC recursively partitions the color space to identify the most dominant colors in an image.

Colors can be sorted by either dominance (how frequently the color appears in the image) or [relative luminance](https://en.wikipedia.org/wiki/Relative_luminance#Relative_luminance_and_%22gamma_encoded%22_colorspaces) (the perceived brightness of a color relative to the other colors in the quantized palette).
