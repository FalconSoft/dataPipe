import { parseNumberOrNull } from "./utils";

export class ParsingOptions {
    separator: string = ',';
    skipRows: number = 0;
    skipUntil?: (tokens: string[]) => boolean;
    takeWhile?: (tokens: string[]) => boolean;
    parseFields?: {};
    elementSelector?: (tokens: any[]) => any;
}

type ParsingContext = { content: string, currentIndex: number };

function getLineTokens(content: string, delimiter: string): any[][] {
    const ctx = <ParsingContext>{
        content: content,
        currentIndex: 0

    };

    const result = [];

    do {
        const tokens = nextLineTokens(ctx, delimiter);
        result.push(tokens);
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


    // a silly way to implement csv parser
    const lineTokens = content.split('\n').map(line => line.split(delimiter))
    const fieldNames = lineTokens.shift() || [];

    return lineTokens
        .map(l => {
            const obj = Object.create(null);
            for (let i = 0; i < fieldNames.length; i++) {
                let value: string | number = l[i].trim();
                if(value.length){
                    const num = parseNumberOrNull(value);
                    value = num || value;
                }
                obj[fieldNames[i]] = value
            }
            return obj;
        })


    // return result;
}

function nextLineTokens(context: ParsingContext, delimiter: string = ','): any[] {
    const tokens: string[] = [];
    let token = '';

    context.currentIndex = 0;
    do {
        const currentChar = context.content[context.currentIndex];
        if (currentChar === delimiter) {
            if (token.length) {
                token = '';
                tokens.push(token);
            }
        } else {
            token += currentChar;
        }
    }
    while (++context.currentIndex < context.content.length
        || context.content[context.currentIndex] === '\n')

    tokens.push(token);
    return tokens;
}

