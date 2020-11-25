/**
 * Truncates a string to a word break.
 * @param {string} str The string to be truncaed.
 * @param {number} len The length that the string will be truncated to.
 * @param {string} append This is optional.
 * @returns {string} The truncated string.
 */
function truncateString(str, len, append = "...") {
  let newLength;

  if (str.indexOf(" ") + append.length > len) {
    return str; //if the first word + the appended text is too long, the function returns the original String
  }

  str.length + append.length > len
    ? (newLength = len - append.length)
    : (newLength = str.length); // if the length of original string and the appended string is greater than the max length, we need to truncate, otherwise, use the original string

  let tempString = str.substring(0, newLength); //cut the string at the new length
  tempString = tempString.replace(/\s+\S*$/, ""); //find the last space that appears before the substringed text

  if (append.length > 0) {
    tempString = tempString + append;
  }
  return tempString;
}

export { truncateString };
