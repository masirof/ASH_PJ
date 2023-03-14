const getElementByIdOrThrow = function (id: string) {
  const element = document.getElementById(id);
  if (!element) {
    throw Error(`Failed to get element #${id}.`);
  }

  return element;
};

export { getElementByIdOrThrow };
