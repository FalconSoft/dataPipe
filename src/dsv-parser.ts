import { parseNumberOrNull } from "./utils";

export class ParsingOptions {
    separator: string = ',';
    skipRows: number = 0;
    skipUntil?: (tokens: string[]) => boolean;
    takeWhile?: (tokens: string[]) => boolean;
    parseFields?: {};
    elementSelector?: (headers: string[], tokens: string[]) => any;
}

type ParsingContext = { content: string, currentIndex: number };

function getObjectElement(fieldNames: string[], tokens: string[]): any {
    const obj = Object.create(null);
    for (let i = 0; i < fieldNames.length; i++) {
        let value: string | number | null = tokens[i] || null;
        if (value && value.length) {
            const num = parseNumberOrNull(value);
            value = num || value;
        }
        obj[fieldNames[i]] = value
    }
    return obj;
}

function getLineTokens(content: string, options: ParsingOptions): string[][] {
    const ctx = <ParsingContext>{
        content: content,
        currentIndex: 0
    };
    content = (content || '').trim();
    const delimiter = options.separator || ',';

    const result = [];
    let line = 0;
    let fieldNames: string[] | null = null;

    do {
        const tokens = nextLineTokens(ctx, delimiter);
        if (!fieldNames) {
            fieldNames = tokens;
            continue;
        }

        const obj = (typeof options.elementSelector === "function") ?
            options.elementSelector(fieldNames, tokens)
            : getObjectElement(fieldNames, tokens)

        result.push(obj);
    }
    while (++ctx.currentIndex < ctx.content.length)

    return result;
}

export function fromCsv(content: string, options?: ParsingOptions): any[] {
    const result: any[] = [];
    content = (content || '').trim();
    const delimiter = options?.separator || ',';

    if (!content.length) {
        return result;
    }

    return getLineTokens(content, options || new ParsingOptions());
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

