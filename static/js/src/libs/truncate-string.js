/**
 * Truncates a string to a word break.
 * @param {string} str The string to be truncated.
 * @param {number} len The length that the string will be truncated to.
 * @param {string} append This is optional.
 * @returns {string} The truncated string.
 */
function truncateString(str, len, append = "…") {
  let newLength;

  // Handle zero or negative length case
  if (len <= 0) {
    return "";
  }

  // Handle case where append length is greater than or equal to the max length
  if (append.length >= len) {
    return str;
  }

  // If the original string length is less than or equal to the specified length
  if (str.length <= len) {
    return str;
  }

  // if the length of original string and the appended string is greater than the max length, we need to truncate, otherwise, use the original string
  if (str.length + append.length > len) {
    newLength = len - append.length;
  } else {
    newLength = str.length;
  }

  // If there's no space or if the string has no spaces, truncate directly
  if (str.indexOf(" ") === -1) {
    return str.substring(0, newLength) + append;
  }

  let tempString = str.substring(0, newLength); //cut the string at the new length
  tempString = tempString.replace(/\s+\S*$/, ""); //find the last space that appears before the substringed text

  if (append.length > 0) {
    tempString += append;
  }
  return tempString;
}

export { truncateString };
