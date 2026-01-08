/*!
 * Basic TypeScript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.com/).
 *
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 *
 * Based on 'quantize.js' Copyright 2008 Nick Rabinowitz: https://gist.github.com/nrabinowitz/1104622
 * and 'color-quantize' Copyright 2022 Barba828: https://github.com/Barba828/color-quantize
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */

export type Pixel = number[]; // [R, G, B] for given pixel
type Histo = number[]; // Number of pixels in each quantized region of colorspace

// private constants
const sigbits = 5;
const rshift = 8 - sigbits;
const maxIterations = 1000;
const fractByPopulations = 0.75;

// Protovis methods: https://mbostock.github.io/protovis//
const pv = {
  naturalOrder: <T>(a: T, b: T) => {
    return a < b ? -1 : a > b ? 1 : 0;
  },
  sum: <T>(array: T[], f?: (t: T) => number) => {
    return array.reduce((p, t) => {
      return p + (f ? f.call(array, t) : Number(t));
    }, 0);
  },
  max: <T>(array: T[], f?: (d: T) => number) => {
    return Math.max.apply(null, f ? array.map(f) : array.map((d) => Number(d)));
  },
};
//

// get reduced-space color index for a pixel
const getColorIndex = (r: number, g: number, b: number) => {
  return (r << (2 * sigbits)) + (g << sigbits) + b;
};

// Simple priority queue
type Comparator<T> = (a: T, b: T) => number;

class PQueue<T> extends Array<T> {
  _sorted: boolean = false;

  constructor(
    protected _comparator: Comparator<T> = (a, b) => Number(a) - Number(b)
  ) {
    super();
  }

  sort = (comparator?: Comparator<T>) => {
    this._comparator = comparator ? comparator : this._comparator;
    this._sorted = true;
    return super.sort(this._comparator);
  };

  push = (o: T) => {
    this._sorted = false;
    return super.push(o);
  };

  peek = (index?: number) => {
    if (!this._sorted) this.sort();
    if (index === undefined) index = this.length - 1;
    return this[index] as T;
  };

  pop = () => {
    if (!this._sorted) this.sort();
    return super.pop() as T;
  };

  size = () => {
    return this.length;
  };

  debug = () => {
    if (!this._sorted) this.sort();
    return this;
  };
}

// 3d color space box

type VBoxRangeKey = "r1" | "r2" | "g1" | "g2" | "b1" | "b2";

class VBox {
  private _count: number = -1;
  private _volume: number = 0;
  private _avg: Pixel = [];

  constructor(
    public r1: number, // min red
    public r2: number, // max red
    public g1: number,
    public g2: number,
    public b1: number,
    public b2: number,
    public histo: Histo
  ) {}

  volume = (force?: boolean) => {
    if (this._volume && !force) {
      return this._volume;
    }
    this._volume =
      (this.r2 - this.r1 + 1) *
      (this.g2 - this.g1 + 1) *
      (this.b2 - this.b1 + 1);
    return this._volume;
  };

  count = (force?: boolean) => {
    if (this._count > -1 && !force) {
      return this._count;
    }

    let count = 0,
      i,
      j,
      k,
      index;
    for (i = this.r1; i <= this.r2; i++) {
      for (j = this.g1; j <= this.g2; j++) {
        for (k = this.b1; k <= this.b2; k++) {
          index = getColorIndex(i, j, k);
          count += this.histo[index] || 0;
        }
      }
    }
    this._count = count;
    return this._count;
  };

  copy = () => {
    return new VBox(
      this.r1,
      this.r2,
      this.g1,
      this.g2,
      this.b1,
      this.b2,
      this.histo
    );
  };

  avg = (force?: boolean) => {
    if (this._avg.length && !force) {
      return this._avg;
    }
    let ntot = 0,
      mult = 1 << rshift,
      rsum = 0,
      gsum = 0,
      bsum = 0,
      hval,
      i,
      j,
      k,
      histoindex;
    for (i = this.r1; i <= this.r2; i++) {
      for (j = this.g1; j <= this.g2; j++) {
        for (k = this.b1; k <= this.b2; k++) {
          histoindex = getColorIndex(i, j, k);
          hval = this.histo[histoindex] || 0;
          ntot += hval;
          rsum += hval * (i + 0.5) * mult;
          gsum += hval * (j + 0.5) * mult;
          bsum += hval * (k + 0.5) * mult;
        }
      }
    }
    if (ntot) {
      this._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
    } else {
      // empty box
      this._avg = [
        ~~((mult * (this.r1 + this.r2 + 1)) / 2),
        ~~((mult * (this.g1 + this.g2 + 1)) / 2),
        ~~((mult * (this.b1 + this.b2 + 1)) / 2),
      ];
    }
    return this._avg;
  };

  contains = (pixel: number[]) => {
    const [rval, gval, bval] = pixel.map((num) => num >> rshift);
    return (
      rval >= this.r1 &&
      rval <= this.r2 &&
      gval >= this.g1 &&
      gval <= this.g2 &&
      bval >= this.b1 &&
      bval <= this.b2
    );
  };
}

// Color map
type VBoxItem = {
  vbox: VBox;
  color: Pixel;
};

export class CMap {
  static _compare = (a: VBoxItem, b: VBoxItem) => {
    return pv.naturalOrder(
      a.vbox.count() * a.vbox.volume(),
      b.vbox.count() * b.vbox.volume()
    );
  };

  vboxes: PQueue<VBoxItem>;

  constructor() {
    this.vboxes = new PQueue<VBoxItem>(CMap._compare);
  }

  push = (vbox: VBox) => {
    this.vboxes.push({
      vbox: vbox,
      color: vbox.avg(),
    });
  };

  palette = () => {
    return this.vboxes.map((vb) => vb.color);
  };

  paletteWithCounts = (): { color: Pixel; count: number }[] => {
    return this.vboxes.map((vb) => ({
      color: vb.color,
      count: vb.vbox.count(),
    }));
  };

  size = () => {
    return this.vboxes.size();
  };

  map = (color: Pixel) => {
    for (let i = 0; i < this.vboxes.size(); i++) {
      if (this.vboxes.peek(i).vbox.contains(color)) {
        return this.vboxes.peek(i).color;
      }
    }
    return this.nearest(color);
  };

  nearest = (color: Pixel) => {
    let i, d1, d2, pColor;
    for (i = 0; i < this.vboxes.size(); i++) {
      d2 =
        Math.pow(color[0] - this.vboxes.peek(i).color[0], 2) +
        Math.pow(color[1] - this.vboxes.peek(i).color[1], 2) +
        Math.pow(color[2] - this.vboxes.peek(i).color[2], 2);
      if (d1 === undefined || d2 < d1) {
        d1 = d2;
        pColor = this.vboxes.peek(i).color;
      }
    }
    return pColor;
  };

  forcebw = () => {
    this.vboxes.sort((a: VBoxItem, b: VBoxItem) => {
      return pv.naturalOrder(pv.sum(a.color), pv.sum(b.color));
    });

    // force darkest color to black if everything < 5
    const lowest = this.vboxes[0].color;
    if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
      this.vboxes[0].color = [0, 0, 0];

    // force lightest color to white if everything > 251
    const idx = this.vboxes.length - 1,
      highest = this.vboxes[idx].color;
    if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
      this.vboxes[idx].color = [255, 255, 255];

    this.vboxes.sort(CMap._compare);
  };
}

// histo (1-d array, giving the number of pixels in
// each quantized region of color space), or null on error
const getHisto = (pixels: Pixel[]): Histo => {
  let histo = new Array<number>(1 << (3 * sigbits)),
    index,
    rval,
    gval,
    bval;

  pixels.forEach((pixel) => {
    rval = pixel[0] >> rshift;
    gval = pixel[1] >> rshift;
    bval = pixel[2] >> rshift;

    index = getColorIndex(rval, gval, bval);
    histo[index] = (histo[index] || 0) + 1;
  });

  return histo;
};

const vboxFromPixels = (pixels: Pixel[], histo: Histo) => {
  let rmin = Number.MAX_SAFE_INTEGER,
    rmax = 0,
    gmin = Number.MAX_SAFE_INTEGER,
    gmax = 0,
    bmin = Number.MAX_SAFE_INTEGER,
    bmax = 0,
    rval,
    gval,
    bval;

  // find min/max
  pixels.forEach((pixel) => {
    rval = pixel[0] >> rshift;
    gval = pixel[1] >> rshift;
    bval = pixel[2] >> rshift;

    if (rval < rmin) rmin = rval;
    if (rval > rmax) rmax = rval;
    if (gval < gmin) gmin = gval;
    if (gval > gmax) gmax = gval;
    if (bval < bmin) bmin = bval;
    if (bval > bmax) bmax = bval;
  });

  return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
};

const medianCutApply = (histo: Histo, vbox: VBox): VBox[] => {
  if (!vbox.count()) return [];

  const rw = vbox.r2 - vbox.r1 + 1,
    gw = vbox.g2 - vbox.g1 + 1,
    bw = vbox.b2 - vbox.b1 + 1,
    maxw = pv.max([rw, gw, bw]);

  // only one pixel, no split
  if (vbox.count() === 1) {
    return [vbox.copy()];
  }

  /* Find the partial sum arrays along the selected axis. */
  let total = 0,
    partialsum: number[] = [],
    i,
    j,
    k,
    sum,
    index;

  if (maxw === rw) {
    for (i = vbox.r1; i <= vbox.r2; i++) {
      sum = 0;
      for (j = vbox.g1; j <= vbox.g2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(i, j, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else if (maxw === gw) {
    for (i = vbox.g1; i <= vbox.g2; i++) {
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(j, i, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else {
    /* maxw == bw */
    for (i = vbox.b1; i <= vbox.b2; i++) {
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.g1; k <= vbox.g2; k++) {
          index = getColorIndex(j, k, i);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  }

  const doCut = (color: "r" | "g" | "b") => {
    const dim1 = (color + "1") as VBoxRangeKey;
    const dim2 = (color + "2") as VBoxRangeKey;
    let left, right, vbox1, vbox2, cutIndex;

    for (i = vbox[dim1]; i <= vbox[dim2]; i++) {
      if (partialsum[i] >= total / 2) {
        break;
      }
    }

    vbox1 = vbox.copy();
    vbox2 = vbox.copy();
    left = i - vbox[dim1];
    right = vbox[dim2] - i;
    cutIndex =
      left <= right
        ? Math.min(vbox[dim2] - 1, ~~(i + right / 2))
        : Math.max(vbox[dim1], ~~(i - 1 - left / 2));
    // avoid 0-count boxes
    while (!partialsum[cutIndex] && cutIndex <= vbox[dim2]) cutIndex++;
    // set dimensions
    vbox1[dim2] = cutIndex;
    vbox2[dim1] = cutIndex + 1;
    //console.log("vbox counts:", vbox.count(), vbox1.count(), vbox2.count());
    return [vbox1, vbox2];
  };

  // determine the cut planes
  return maxw === rw ? doCut("r") : maxw === gw ? doCut("g") : doCut("b");
};

export const quantize = (pixels: Pixel[], maxColors: number) => {
  //short-circuit
  if (!pixels.length || maxColors < 1 || maxColors > 256) {
    console.log("Max colors must be between 1 and 256");
    return new CMap();
  }

  const histo = getHisto(pixels);

  // get the beginning vbox from the colors
  const vbox = vboxFromPixels(pixels, histo);
  const pq = new PQueue<VBox>((a, b) => {
    return pv.naturalOrder(a.count(), b.count());
  });
  pq.push(vbox);

  // inner function to do the iteration
  const iter = (lh: PQueue<VBox>, target: number) => {
    let ncolors = lh.size(),
      niters = 0,
      vbox: VBox;

    while (niters < maxIterations) {
      if (ncolors >= target) return;
      if (!lh.peek().count()) return;
      niters++;

      vbox = lh.pop();
      if (!vbox.count()) {
        /* just put it back */
        lh.push(vbox);
        niters++;
        continue;
      }

      // do the cut
      const vboxes = medianCutApply(histo, vbox);
      const vbox1 = vboxes[0];
      const vbox2 = vboxes[1];

      if (!vbox1) {
        console.log("vbox1 not defined; shouldn't happen!");
        return;
      }

      lh.push(vbox1);

      if (vbox2) {
        /* vbox2 can be null */
        lh.push(vbox2);
        ncolors++;
      }
    }
  };

  // first set of colors, sorted by population
  iter(pq, fractByPopulations * maxColors);
  // console.log(pq.size(), pq.debug().length, pq.debug().slice());

  // Re-sort by the product of pixel occupancy times the size in color space.
  const pq2 = new PQueue<VBox>((a, b) => {
    return pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
  });

  while (pq.size()) {
    pq2.push(pq.pop());
  }

  // next set - generate the median cuts using the (npix * vol) sorting.
  iter(pq2, maxColors);

  // calculate the actual colors
  const cmap = new CMap();
  while (pq2.size()) {
    cmap.push(pq2.pop());
  }

  return cmap;
};
