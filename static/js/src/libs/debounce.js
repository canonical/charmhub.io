/**
 * Debounce
 * @param {Function} func Function to run.
 * @param {Number} wait Time to wait between tries.
 * @param {Boolean} immediate Immediately call func.
 */
export default function debounce(func, wait, immediate) {
  let timeout;

  const debounced = function () {
    const args = arguments;
    let later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };

  debounced.clear = function () {
    clearTimeout(timeout);
  };

  return debounced;
}
