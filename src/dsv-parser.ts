import { parseNumberOrNull, parseDatetimeOrNull } from "./utils";

export class ParsingOptions {
    delimiter: string = ',';
    skipRows: number = 0;
    dateFields: string[] = [];
    numberFields: string[] = [];
    booleanFields: string[] = [];
    skipUntil?: (tokens: string[]) => boolean;
    takeWhile?: (tokens: string[]) => boolean;
    parseFields?: {};
    elementSelector?: (headers: string[], tokens: string[]) => any;
}

export function parseCsv(content: string, options?: ParsingOptions): any[] {
    const result: any[] = [];
    content = content || '';

    if (!content.length) {
        return result;
    }

    return getLineTokens(content, options || new ParsingOptions());
}

export function toCsv(array: any[], delimiter: string = ','): string {
    array = array || [];

    var result = "";
    const headers: string[] = [];

    // workout all headers
    for (const item of array) {
        for (const name in item) {
            if (headers.indexOf(name) < 0) { headers.push(name); }
        }
    }

    // create a csv string
    const lines = array.map(item => {
        const values: string[] = [];
        for (const name of headers) {
            let value: any = item[name];
            if (value instanceof Date) {
                value = parseDatetimeOrNull(value);
            } else if (typeof value === "string" && value.indexOf(delimiter) >= 0) {
                value = '"' + value + '"';
            }

            values.push(value || '')
        }
        return values.join(delimiter);

    });
    lines.unshift(headers.join(delimiter))

    return lines.join('\n')
}

type ParsingContext = {
    content: string,
    currentIndex: number
};

function getObjectElement(fieldNames: string[], tokens: string[], options: ParsingOptions): any {
    const obj = Object.create(null);
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        let value: string | number | Date | boolean | null = tokens[i] || null;

        if (value && value.length) {
            if (options.dateFields && options.dateFields.indexOf(fieldName) >= 0) {
                value = parseDatetimeOrNull(value);
            } else if (options.numberFields && options.numberFields.indexOf(fieldName) >= 0) {
                value = parseNumberOrNull(value);
            } else if (options.booleanFields && options.booleanFields.indexOf(fieldName) >= 0) {
                value = !!value;
            } else {
                const num = parseNumberOrNull(<string>value);
                value = num || value;
            }
        }
        obj[fieldName] = value
    }
    return obj;
}

function getLineTokens(content: string, options: ParsingOptions): string[][] {
    const ctx = <ParsingContext>{
        content: content,
        currentIndex: 0
    };
    content = content || '';
    const delimiter = options.delimiter || ',';

    const result = [];
    let lineNumber = 0;
    let fieldNames: string[] | null = null;
    let isEmpty = true;

    do {
        const tokens = nextLineTokens(ctx, delimiter);

        isEmpty = tokens.filter(f => !f || !f.length).length === tokens.length;

        if (isEmpty) {
            lineNumber++;
            continue;
        }

        // skip rows based skipRows value
        if (lineNumber < options.skipRows) {
            lineNumber++;
            continue;
        }

        // skip rows based on skipUntil call back
        if (!fieldNames && typeof options.skipUntil === "function" && !options.skipUntil(tokens)) {
            lineNumber++;
            continue;
        }

        if (!fieldNames) {
            // fieldName is used as indicator on whether data rows handling started
            fieldNames = tokens;
            lineNumber++;
            continue;
        }

        if (typeof options.takeWhile === "function" && fieldNames && !options.takeWhile(tokens)) {
            break;
        }

        const obj = (typeof options.elementSelector === "function") ?
            options.elementSelector(fieldNames, tokens)
            : getObjectElement(fieldNames, tokens, options)

        if (obj) {
            // no need for null or empty objects
            result.push(obj);
        }
        lineNumber++;
    }
    while (++ctx.currentIndex < ctx.content.length)

    return result;
}

function nextLineTokens(context: ParsingContext, delimiter: string = ','): string[] {
    const tokens: string[] = [];
    let token = '';

    do {
        const currentChar = context.content[context.currentIndex];
        if (currentChar === '\n') {
            if (context.content[context.currentIndex + 1] === '\r') { context.currentIndex++; }
            break;
        }

        if (token.length === 0 && currentChar === '"') {
            while (context.content[++context.currentIndex] !== '"') {
                token += context.content[context.currentIndex];
            }

        } else if (currentChar === delimiter) {
            tokens.push(token);
            token = '';
        } else {
            token += currentChar;
        }
    }
    while (++context.currentIndex < context.content.length)

    tokens.push(token);
    return tokens;
}

