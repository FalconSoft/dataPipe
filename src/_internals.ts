import { Selector } from "./types";

export function fieldSelector(input: string | string[] | Selector<any, string>): Selector<any, string> {
    if (typeof input === "function") {
        return input;
    } else if (typeof input === "string") {
        return (item): any => item[input];
    } else if (Array.isArray(input)) {
        return (item): any => input.map(r => item[r]).join('|');
    } else {
        throw Error(`Unknown input. Can't create a fieldSelector`)
    }
}