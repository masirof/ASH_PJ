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

export { getElementByIdOrThrow, shuffleArray };
