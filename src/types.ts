export type Predicate<T = any> = (p: T) => boolean;
export type Selector<T = any, V = any> = (p: T) => V;
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