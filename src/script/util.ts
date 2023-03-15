const getElementByIdOrThrow = function (id: string) {
  const element = document.getElementById(id);
  if (!element) {
    throw Error(`Failed to get element #${id}.`);
  }

  return element;
};

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

class DataLoader<T> implements Iterator<T> {
  photoData: T[];
  indexMap: number[] = [];
  index = 0;

  constructor(photoData: T[]) {
    this.photoData = photoData;
    this.indexMap = this.indexMap = new Array(this.photoData.length)
      .fill(0)
      .map((_, i) => i);
  }

  reset() {
    this.index = 0;
    this.indexMap = new Array(this.photoData.length).fill(0).map((_, i) => i);
  }

  shuffle() {
    shuffleArray(this.indexMap);
  }

  next() {
    if (this.index >= this.indexMap.length) {
      return {
        value: this.photoData[this.indexMap[this.indexMap.length - 1]],
        done: true,
      };
    }

    const item = this.photoData[this.indexMap[this.index]];
    this.index += 1;

    return {
      value: item,
      done: this.index >= this.indexMap.length,
    };
  }

  done() {
    return this.index >= this.indexMap.length;
  }
}

export { getElementByIdOrThrow, shuffleArray, DataLoader };
