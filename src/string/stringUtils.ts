export function formatCamelStr(str = ''): string {
  return str
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
}

export function replaceAll(text: string, searchValue: string, replaceValue = ''): string {
  return text.replace(new RegExp(searchValue, 'g'), replaceValue || '');
}

/**
 * trims characters from the left
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
export function trimStart(text: string, characters = ' \n\t\r'): string {
  if (!text) {
    return text;
  }
  
  let startIndex = 0;
  while (characters.indexOf(text.charAt(startIndex)) >= 0) {
    startIndex++;
  }
  return text.substring(startIndex);
}

/**
 * trims characters from the right
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
export function trimEnd(text: string, characters = ' \n\t\r'): string {
  if (!text) {
    return text;
  }

  let endIndex = text.length;
  while (characters.indexOf(text.charAt(endIndex - 1)) >= 0) {
    endIndex--;
  }
  return text.substring(0, endIndex);
}

/**
 * trims characters from both sides
 * @param text text to trim
 * @param characters character to trim
 * @returns trimmed string
 */
export function trim(text: string, characters = ' \n\t\r'): string {
  return trimStart(trimEnd(text, characters), characters);
}

/**
 * Splits string into array of tokens based on a separator(one or many).
 * Also, you can define open close brackets.
 * e.g. split('field1=func(a,b,c),field2=4', ',', ['()'])
 * // result = ["field1=func(a,b,c)", "field2=4"]
 * @param text Text to split
 * @param separator
 * @param openClose
 * @returns
 */
export function split(text: string, separator = ',', openClose?: string[]): string[] {
  const res: string[] = [];

  if (!text) {
    return res;
  }

  openClose = openClose || [];
  let index = -1;

  let token = '';
  while (++index < text.length) {
    let currentChar = text[index];

    const oIndex = openClose.findIndex(s => s[0] === currentChar);
    if (oIndex >= 0) {
      token += text[index];
      let innerBrackets = 0;
      while (text[++index] !== openClose[oIndex][1] || innerBrackets) {
        currentChar = text[index];
        token += currentChar;

        if (currentChar === openClose[oIndex][0]) {
          innerBrackets++;
        }

        if (currentChar === openClose[oIndex][1]) {
          innerBrackets--;
        }

        if (index + 1 === text.length) {
          throw new Error(`Closing bracket is missing`);
        }
      }
      token += text[index];
      continue;
    }

    if (separator.includes(currentChar)) {
      res.push(token);
      token = '';
    } else {
      token += currentChar;
    }
  }

  res.push(token);

  return res;
}
