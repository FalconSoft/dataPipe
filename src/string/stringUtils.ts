export function formatCamelStr(str = ""): string {
  return str
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");
}

export function replaceAll(
  text: string,
  searchValue: string,
  replaceValue = ""
): string {
  return text.replace(new RegExp(searchValue, "g"), replaceValue || "");
}

/**
 * trims characters from the left
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
export function trimStart(text: string, characters = " \n\t\r"): string {
  let startIndex = 0;
  while (characters.indexOf(text.charAt(startIndex)) >= 0) {
    startIndex++;
  }
  return text.substr(startIndex);
}

/**
 * trims characters from the right
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
 export function trimEnd(text: string, characters = " \n\t\r"): string {
  let endIndex = text.length;
  while (characters.indexOf(text.charAt(endIndex - 1)) >= 0) {
    endIndex--;
  }
  return text.substr(0, endIndex);
}

/**
 * trims characters from both sides
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
 export function trim(text: string, characters = " \n\t\r"): string {
     return trimStart(trimEnd(text, characters), characters);
  }
  