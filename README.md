# Wiki Palette

A web app that generates color palettes from Wikipedia article images.

Search for any Wikipedia article, and Wiki Palette extracts the dominant colors from its lead image using a modified median cut quantization algorithm.

## Features

- **Wikipedia Search** — Search articles with keyboard navigation and autocomplete
- **Random Article** — Get inspired by a random Wikipedia article
- **Color Extraction** — Extracts 4 dominant colors from article images
- **Sort Options** — Sort palette by dominance (frequency) or luminance (brightness)
- **Copy Colors** — Click any color to copy its hex value

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start development server            |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview production build            |

## How It Works

The color quantization algorithm is a TypeScript implementation of the modified median cut algorithm from the Leptonica library. It recursively partitions the color space to identify the most dominant colors in an image.

Colors can be sorted by:

- **Dominance** — How frequently the color appears in the image
- **Luminance** — Brightness using the W3C relative luminance formula
