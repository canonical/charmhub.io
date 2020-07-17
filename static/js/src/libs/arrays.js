/**
 * Merges 2 arrays and dedupes
 * @param {array} arr1
 * @param {array} arr2
 * @returns {array}
 */
function arraysMerge(arr1, arr2) {
  const arr3 = [...arr1, ...arr2];

  return arr3.filter((item, i) => arr3.indexOf(item) === i);
}

export { arraysMerge };
