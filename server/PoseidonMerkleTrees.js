import { buildPoseidon } from "circomlibjs";

export class MerkleTree {
  constructor(depth, poseidon) {
    this.depth = depth;
    this.poseidon = poseidon;

    this.zeroes = [];
    this.layers = [];

    this.buildZeroes();
    this.buildEmptyTree();
  }

  buildZeroes() {
    this.zeroes[0] = BigInt(0);
    for (let i = 1; i <= this.depth; i++) {
      const hash = this.poseidon([this.zeroes[i - 1], this.zeroes[i - 1]]);
      // Always convert to BigInt
      this.zeroes[i] = BigInt(this.poseidon.F.toObject(hash));
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
    // Ensure leaf is BigInt
    const leafBigInt = typeof leaf === 'bigint' ? leaf : BigInt(leaf);
    
    let index = this.layers[0].length;
    this.layers[0].push(leafBigInt);

    let current = leafBigInt;

    for (let level = 1; level <= this.depth; level++) {
      const isRight = index % 2;
      const left = isRight ? this.layers[level - 1][index - 1] : current;
      const right = isRight ? current : this.zeroes[level - 1];

      const hash = this.poseidon([left, right]);
      // Always convert to BigInt
      current = BigInt(this.poseidon.F.toObject(hash));
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
      const sibling = this.layers[level][siblingIndex] ?? this.zeroes[level];

      // Ensure sibling is BigInt
      const siblingBigInt = typeof sibling === 'bigint' ? sibling : BigInt(this.poseidon.F.toObject(sibling));
      
      pathElements.push(siblingBigInt);
      pathIndices.push(isRight ? 1 : 0); // Convert boolean to 0/1

      index = Math.floor(index / 2);
    }

    return { pathElements, pathIndices };
  }

  root() {
    const rootValue = this.layers[this.depth][0];
    // Ensure root is BigInt
    return typeof rootValue === 'bigint' ? rootValue : BigInt(this.poseidon.F.toObject(rootValue));
  }
}
