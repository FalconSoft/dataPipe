import { parseNumberOrNull, parseDatetimeOrNull } from "./utils";
import { ParsingOptions, ScalarType, ScalarObject, TableDto, ScallarTable } from "../types";
import { toTable } from "./table";

type ParsingContext = {
    content: string;
    currentIndex: number;
};

const EmptySymbol = '_#EMPTY#_';

function getObjectElement(fieldNames: string[], tokens: string[], options: ParsingOptions): ScalarObject {
    const obj = Object.create(null);
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        let value: ScalarType = tokens[i] || null;

        if (value && value.length) {
            if (options.dateFields && options.dateFields.indexOf(fieldName) >= 0) {
                value = parseDatetimeOrNull(value);
            } else if (options.numberFields && options.numberFields.indexOf(fieldName) >= 0) {
                value = parseNumberOrNull(value);
            } else if (options.booleanFields && options.booleanFields.indexOf(fieldName) >= 0) {
                value = !!value;
            } else {
                const num = parseNumberOrNull(value as string);
                value = (num === null || num === undefined) ? value : num;
            }
        }
        obj[fieldName] = value === EmptySymbol ? '' : value;
    }
    return obj;
}

function nextLineTokens(context: ParsingContext, delimiter = ','): string[] {
    const tokens: string[] = [];
    let token = '';

    function elementAtOrNull(arr: string, index: number): string | null {
        return (arr.length > index) ? arr[index] : null;
    }

    do {
        const currentChar = context.content[context.currentIndex];
        if (currentChar === '\n') {
            if (context.content[context.currentIndex + 1] === '\r') { context.currentIndex++; }
            break;
        }

        if (token.length === 0 && currentChar === '"') {

            if (elementAtOrNull(context.content, context.currentIndex + 1) === '"'
                && elementAtOrNull(context.content, context.currentIndex + 2) !== '"') {
                // just empty string
                token = EmptySymbol;
                context.currentIndex++;
            }
            else {
                // enumerate till the end of quote
                while (context.content[++context.currentIndex] !== '"') {
                    token += context.content[context.currentIndex];

                    // check if we need to escape ""
                    if (elementAtOrNull(context.content, context.currentIndex + 1) === '"'
                        && elementAtOrNull(context.content, context.currentIndex + 2) === '"') {
                        token += '"';
                        context.currentIndex += 2
                    }
                }
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

function getLineTokens(content: string, options: ParsingOptions): ScalarObject[] {
    const ctx = {
        content: content,
        currentIndex: 0
    } as ParsingContext;
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
            fieldNames = [];

            for (let i = 0; i < tokens.length; i++) {
                // if empty then _
                const token = tokens[i].trim().length ? tokens[i].trim() : '_';
                if (fieldNames.indexOf(token) >= 0) {
                    // need to make sure fieldNames are unique
                    fieldNames.push(token + i)
                } else {
                    fieldNames.push(token)
                }
            }

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

function parseLineTokens(content: string, options: ParsingOptions): ScallarTable {
    const ctx = {
        content: content,
        currentIndex: 0
    } as ParsingContext;
    content = content || '';
    const delimiter = options.delimiter || ',';

    const result = {} as ScallarTable;
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
            fieldNames = [];

            for (let i = 0; i < tokens.length; i++) {
                // if empty then _
                const token = tokens[i].trim().length ? tokens[i].trim() : '_';
                if (fieldNames.indexOf(token) >= 0) {
                    // need to make sure fieldNames are unique
                    fieldNames.push(token + i)
                } else {
                    fieldNames.push(token)
                }
            }

            result.fieldNames = fieldNames;

            lineNumber++;
            continue;
        }

        if (typeof options.takeWhile === "function" && fieldNames && !options.takeWhile(tokens)) {
            break;
        }

        const row = getObjectElement(fieldNames, tokens, options)

        if (row) {
            // no need for null or empty objects
            result.rows.push(tokens);
        }
        lineNumber++;
    }
    while (++ctx.currentIndex < ctx.content.length)

    return result;
}


export function parseCsv(content: string, options?: ParsingOptions): ScalarObject[] {
    content = content || '';

    if (!content.length) {
        return [];
    }

    return getLineTokens(content, options || new ParsingOptions());
}

export function parseCsvToTable(content: string, options?: ParsingOptions): ScallarTable {
    content = content || '';

    if (!content.length) {
        return {} as TableDto;
    }

    const items = getLineTokens(content, options || new ParsingOptions());
    const table = toTable(items)
    return table;
}

export function toCsv(array: ScalarObject[], delimiter = ','): string {
    array = array || [];

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
            let value: ScalarType = item[name];
            if (value instanceof Date) {
                value = parseDatetimeOrNull(value);
            } else if (typeof value === "string" && value.indexOf(delimiter) >= 0) {
                value = '"' + value + '"';
            }
            value = (value !== null && value !== undefined) ? value : '';
            values.push(String(value))
        }
        return values.join(delimiter);

    });
    lines.unshift(headers.join(delimiter))

    return lines.join('\n')
}
