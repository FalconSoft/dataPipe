import { parseNumberOrNull, parseDatetimeOrNull, workoutDataType, parseBooleanOrNull, dateToString } from "./utils";
import { ParsingOptions, ScalarType, ScalarObject, StringsDataTable, FieldDescription, DataTypeName } from "../types";

type ParsingContext = {
    content: string;
    currentIndex: number;
};

const EmptySymbol = '_#EMPTY#_';

function getObjectElement(fieldDescs: FieldDescription[], tokens: string[], options: ParsingOptions): ScalarObject {
    const obj = Object.create(null);
    for (let i = 0; i < fieldDescs.length; i++) {
        const fieldDesc = fieldDescs[i];
        const fieldName = fieldDesc.fieldName;
        let value: ScalarType = tokens[i] || null;

        if (options.textFields && options.textFields.indexOf(fieldName) >= 0) {
            value = tokens[i];
        } else if (fieldDesc.dataTypeName === DataTypeName.DateTime
            || (options.dateFields && options.dateFields.indexOf(fieldName) >= 0)) {
            value = parseDatetimeOrNull(value as string);
        } else if (fieldDesc.dataTypeName === DataTypeName.WholeNumber
            || fieldDesc.dataTypeName === DataTypeName.FloatNumber
            || fieldDesc.dataTypeName === DataTypeName.BigIntNumber
            || (options.numberFields && options.numberFields.indexOf(fieldName) >= 0)) {
            value = parseNumberOrNull(value as string);
        } else if (fieldDesc.dataTypeName === DataTypeName.Boolean
            || (options.booleanFields && options.booleanFields.indexOf(fieldName) >= 0)) {
            value = parseBooleanOrNull(value as string);
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

function parseLineTokens(content: string, options: ParsingOptions): StringsDataTable {
    const ctx = {
        content: content,
        currentIndex: 0
    } as ParsingContext;
    content = content || '';
    const delimiter = options.delimiter || ',';

    const result = {
        fieldDescriptions: [] as FieldDescription[],
        rows: [] as ScalarType[][]
    } as StringsDataTable;
    let lineNumber = 0;
    let fieldNames: string[] | null = null;
    const uniqueValues: string[][] = [];

    do {
        const rowTokens = nextLineTokens(ctx, delimiter);

        // skip if all tokens are empty
        if (rowTokens.filter(f => !f || !f.length).length === rowTokens.length) {
            lineNumber++;
            continue;
        }

        // skip rows based skipRows value
        if (lineNumber < options.skipRows) {
            lineNumber++;
            continue;
        }

        // skip rows based on skipUntil call back
        if (!fieldNames && typeof options.skipUntil === "function" && !options.skipUntil(rowTokens)) {
            lineNumber++;
            continue;
        }

        if (!fieldNames) {
            // fieldName is used as indicator on whether data rows handling started
            fieldNames = [];
            const fieldDescriptions = [];

            for (let i = 0; i < rowTokens.length; i++) {
                // if empty then _
                const token = rowTokens[i].trim().length ? rowTokens[i].trim() : '_';

                // just to ensure no dublicated field names
                fieldNames.push(fieldNames.indexOf(token) >= 0 ? token + i : token)

                fieldDescriptions.push({
                    fieldName: fieldNames[fieldNames.length - 1],
                    isNullable: false,
                    isUnique: true,
                    index: i
                } as FieldDescription)

                uniqueValues.push([]);
            }

            result.fieldDescriptions = fieldDescriptions;
            result.fieldNames = fieldNames;

            lineNumber++;
            continue;
        }

        if (typeof options.takeWhile === "function" && fieldNames && !options.takeWhile(rowTokens)) {
            break;
        }

        // analyze each cell in a row
        for (let i = 0; i < rowTokens.length; i++) {
            const fDesc = result.fieldDescriptions[i];
            const value = rowTokens[i];

            if (value === null || value === undefined || value.length === 0) {
                fDesc.isNullable = true
            } else {
                const newType = workoutDataType(value, fDesc.dataTypeName);
                if (newType !== fDesc.dataTypeName) {
                    fDesc.dataTypeName = newType;
                }

                if ((fDesc.dataTypeName == DataTypeName.String || fDesc.dataTypeName == DataTypeName.LargeString)
                    && String(value).length > (fDesc.maxSize || 0)) {
                    fDesc.maxSize = String(value).length;
                }
            }

            if (fDesc.isUnique && uniqueValues[i].indexOf(value) >= 0) {
                fDesc.isUnique = false;
            } else {
                uniqueValues[i].push(value);
            }
        }

        // no need for null or empty objects
        result.rows.push(rowTokens);
        lineNumber++;
    }
    while (++ctx.currentIndex < ctx.content.length)

    result.fieldDataTypes = result.fieldDescriptions.map(f => f.dataTypeName as DataTypeName);
    return result;
}

export function parseCsv(content: string, options?: ParsingOptions): ScalarObject[] {
    content = content || '';
    options = options || {} as ParsingOptions;
    if (!content.length) {
        return [];
    }

    const table = parseLineTokens(content, options || new ParsingOptions());

    const result: ScalarObject[] = [];
    for (let i = 0; i < table.rows.length; i++) {
        const obj = (typeof options.elementSelector === "function") ?
            options.elementSelector(table.fieldDescriptions, table.rows[i] as string[])
            : getObjectElement(table.fieldDescriptions, table.rows[i] as string[], options)

        if (obj) {
            // no need for null or empty objects
            result.push(obj);
        }

    }

    return result;
}

export function parseCsvToTable(content: string, options?: ParsingOptions): StringsDataTable {
    content = content || '';

    if (!content.length) {
        return {} as StringsDataTable;
    }

    return parseLineTokens(content, options || new ParsingOptions());
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
                value = dateToString(value);
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
