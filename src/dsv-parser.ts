export class ParsingOptions {
    separator: string = ',';
    skipRows: number = 0;
    skipUntil?: (tokens: string[]) => boolean;
    takeWhile?: (tokens: string[]) => boolean;
    parseFields?: {};
    elementSelector?: (tokens: any[]) => any;
}

type ParsingContext = { content: string, currentIndex: number };

export function fromCsv(content: string, options?: ParsingOptions): any[] {
    const result: any[] = [];
    content = (content || '').trim();
    const delimiter = options?.separator || ',';

    if (!content.length) {
        return result;
    }

    const lineTokens = content.split('\n').map(line => line.split(delimiter))

    const fieldNames = lineTokens.shift() || [];

    return lineTokens
        .map(l => {
            const obj = Object.create(null);
            for (let i = 0; i < fieldNames.length; i++) {
                obj[fieldNames[i]] = l[i].trim();
            }
            return obj;
        })


    // const ctx = <ParsingContext>{
    //     content: content,
    //     currentIndex: 0
    // };

    // nextLineTokens(ctx, delimiter);
    // // while(){}


    // return result;
}

function nextLineTokens(context: ParsingContext, delimiter: string = ','): string[] {
    const tokens: string[] = [];
    let token = '';

    while (context.currentIndex < context.content.length
        || context.content[context.currentIndex]) {
        const currentChar = context.content[context.currentIndex++];
        if (currentChar === delimiter) {
            tokens.push(token);
        } else {
            token += currentChar;
        }
    }

    tokens.push(token);
    return tokens;
}

