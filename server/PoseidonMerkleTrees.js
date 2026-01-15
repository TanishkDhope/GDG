import { buildPoseidon } from "circomlibjs";

export class PoseidonMerkleTree {
  constructor(depth, poseidon) {
    this.depth = depth;
    this.poseidon = poseidon;

    this.zeroes = [];
    this.layers = [];

    this.buildZeroes();
    this.buildEmptyTree();
  }

  buildZeroes() {
    this.zeroes[0] = 0n;
    for (let i = 1; i <= this.depth; i++) {
      this.zeroes[i] = this.poseidon([this.zeroes[i-1], this.zeroes[i-1]]);
    }
  }

  buildEmptyTree() {
    this.layers[0] = [];
    for (let i = 1; i <= this.depth; i++) {
      this.layers[i] = [];
      this.layers[i][0] = this.zeroes[i];
    }
  }

  insert(leaf) {
    let index = this.layers[0].length;
    this.layers[0].push(leaf);

    let current = leaf;

    for (let level = 1; level <= this.depth; level++) {
      const isRight = index % 2;
      const left = isRight ? this.layers[level-1][index-1] : current;
      const right = isRight ? current : this.zeroes[level-1];

      current = this.poseidon([left, right]);
      index = Math.floor(index / 2);

      this.layers[level][index] = current;
    }
    
    return this.layers[0].length - 1; // Return the index where leaf was inserted
  }

  getProof(leafIndex) {
  const pathElements = [];
  const pathIndices = [];

  let index = leafIndex;

  for (let level = 0; level < this.depth; level++) {
    const isRight = index % 2;

    const siblingIndex = isRight ? index - 1 : index + 1;
    const sibling =
      this.layers[level][siblingIndex] ?? this.zeroes[level];

    pathElements.push(sibling);
    pathIndices.push(isRight);

    index = Math.floor(index / 2);
  }

  return { pathElements, pathIndices };
}


  root() {
    return this.layers[this.depth][0];
  }
}
