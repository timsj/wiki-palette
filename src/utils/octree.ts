/**
 * Octree Color Quantization
 *
 * TypeScript implementation based on the octree color quantization algorithm.
 * Reference: https://github.com/delimitry/octree_color_quantizer
 *
 * The octree approach builds a tree where each level represents one bit of the
 * 8-bit color channels. Colors are inserted by traversing the tree based on
 * the bit values at each level. To reduce colors, leaves are merged bottom-up.
 */

import { Pixel } from "../types";

const MAX_DEPTH = 8;

class OctreeNode {
  red: number = 0;
  green: number = 0;
  blue: number = 0;
  pixelCount: number = 0;
  paletteIndex: number = 0;
  children: (OctreeNode | null)[] = new Array(8).fill(null);

  isLeaf(): boolean {
    return this.pixelCount > 0;
  }

  getLeafNodes(): OctreeNode[] {
    const leafNodes: OctreeNode[] = [];
    for (const node of this.children) {
      if (node) {
        if (node.isLeaf()) {
          leafNodes.push(node);
        } else {
          leafNodes.push(...node.getLeafNodes());
        }
      }
    }
    return leafNodes;
  }

  getNodesPixelCount(): number {
    let count = this.pixelCount;
    for (const node of this.children) {
      if (node) {
        count += node.pixelCount;
      }
    }
    return count;
  }

  addColor(color: Pixel, level: number, parent: OctreeQuantizer): void {
    if (level >= MAX_DEPTH) {
      this.red += color[0];
      this.green += color[1];
      this.blue += color[2];
      this.pixelCount += 1;
      return;
    }

    const index = this.getColorIndexForLevel(color, level);
    if (!this.children[index]) {
      this.children[index] = new OctreeNode();
      if (level < MAX_DEPTH - 1) {
        parent.addLevelNode(level, this.children[index]!);
      }
    }
    this.children[index]!.addColor(color, level + 1, parent);
  }

  getPaletteIndex(color: Pixel, level: number): number {
    if (this.isLeaf()) {
      return this.paletteIndex;
    }
    const index = this.getColorIndexForLevel(color, level);
    if (this.children[index]) {
      return this.children[index]!.getPaletteIndex(color, level + 1);
    }
    // Find any non-null child as fallback
    for (const node of this.children) {
      if (node) {
        return node.getPaletteIndex(color, level + 1);
      }
    }
    return this.paletteIndex;
  }

  removeLeaves(): number {
    let result = 0;
    for (const node of this.children) {
      if (node) {
        this.red += node.red;
        this.green += node.green;
        this.blue += node.blue;
        this.pixelCount += node.pixelCount;
        result += 1;
      }
    }
    this.children = new Array(8).fill(null);
    return result - 1; // -1 because this node becomes a leaf
  }

  getColor(): { color: Pixel; count: number } {
    return {
      color: [
        Math.round(this.red / this.pixelCount),
        Math.round(this.green / this.pixelCount),
        Math.round(this.blue / this.pixelCount),
      ],
      count: this.pixelCount,
    };
  }

  private getColorIndexForLevel(color: Pixel, level: number): number {
    let index = 0;
    const mask = 0b10000000 >> level;
    if (color[0] & mask) index |= 0b100;
    if (color[1] & mask) index |= 0b010;
    if (color[2] & mask) index |= 0b001;
    return index;
  }
}

class OctreeQuantizer {
  private levels: OctreeNode[][] = [];
  private root: OctreeNode;

  constructor() {
    for (let i = 0; i < MAX_DEPTH; i++) {
      this.levels.push([]);
    }
    this.root = new OctreeNode();
  }

  addLevelNode(level: number, node: OctreeNode): void {
    this.levels[level].push(node);
  }

  addColor(color: Pixel): void {
    this.root.addColor(color, 0, this);
  }

  makePalette(colorCount: number): { color: Pixel; count: number }[] {
    const palette: { color: Pixel; count: number }[] = [];
    let paletteIndex = 0;
    let leafCount = this.getLeafCount();

    // Reduce colors by merging leaves from bottom up
    for (let level = MAX_DEPTH - 1; level >= 0; level--) {
      if (leafCount <= colorCount) break;

      for (const node of this.levels[level]) {
        leafCount -= node.removeLeaves();
        if (leafCount <= colorCount) break;
      }
    }

    // Build palette from remaining leaves
    for (const node of this.root.getLeafNodes()) {
      if (paletteIndex >= colorCount) break;
      if (node.isLeaf()) {
        node.paletteIndex = paletteIndex;
        palette.push(node.getColor());
        paletteIndex += 1;
      }
    }

    return palette;
  }

  getPaletteIndex(color: Pixel): number {
    return this.root.getPaletteIndex(color, 0);
  }

  private getLeafCount(): number {
    return this.root.getLeafNodes().length;
  }
}

// Result interface matching CMap's palette method
interface OctreeResult {
  palette(): Pixel[];
}

/**
 * Quantize pixels using octree algorithm
 * @param pixels Array of [R, G, B] pixel values
 * @param maxColors Target number of colors in palette
 * @returns Object with palette() method matching CMap interface
 */
export const octreeQuantize = (
  pixels: Pixel[],
  maxColors: number
): OctreeResult => {
  if (!pixels.length || maxColors < 1 || maxColors > 256) {
    console.log("Max colors must be between 1 and 256");
    return {
      palette: () => [],
    };
  }

  const quantizer = new OctreeQuantizer();

  // Add all pixels to the octree
  for (const pixel of pixels) {
    quantizer.addColor(pixel);
  }

  // Generate palette with counts for sorting
  const paletteWithCounts = quantizer.makePalette(maxColors);

  // Sort by pixel count (most dominant first) to match MMCQ behavior
  paletteWithCounts.sort((a, b) => b.count - a.count);

  return {
    palette: () => paletteWithCounts.map((p) => p.color),
  };
};
