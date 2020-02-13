
export function leftJoin(
    leftArray: any[],
    rightArray: any[],
    leftKeySelector: (item: any) => string,
    rightKeySelector: (item: any) => string,
    resultSelector: (leftItem: any, rightItem: any) => any
): any[] {
    return leftOrInnerJoin(false, leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);
}

export function innerJoin(
    leftArray: any[],
    rightArray: any[],
    leftKeySelector: (item: any) => string,
    rightKeySelector: (item: any) => string,
    resultSelector: (leftItem: any, rightItem: any) => any
): any[] {
    return leftOrInnerJoin(true, leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);
}

export function fullJoin(
    leftArray: any[],
    rightArray: any[],
    leftKeySelector: (item: any) => string,
    rightKeySelector: (item: any) => string,
    resultSelector: (leftItem: any, rightItem: any) => any
): any[] {

    verifyJoinArgs(leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);

    // build a lookup maps for both arrays.
    // so, both jeys have to be unique, otherwise it will flatter result
    const leftArrayMap = Object.create(null);
    for (let item of rightArray) {
        leftArrayMap[leftKeySelector(item)] = item;
    }

    const rightArrayMap = Object.create(null);
    for (let item of rightArray) {
        rightArrayMap[rightKeySelector(item)] = item;
    }

    const result: any[] = [];
    for (let leftItem of leftArray) {
        const leftKey = leftKeySelector(leftItem);
        const rightItem = rightArrayMap[leftKey] || null;

        const resultItem = resultSelector(leftItem, rightItem);

        // if result is null then probably a left item was modified
        result.push(resultItem || leftItem);
        if (rightItem) {
            delete rightArrayMap.leftKey;
        }
    }

    // add remaining right items
    for (let rightItemKey in rightArrayMap) {
        const rightItem = rightArrayMap[rightItemKey];
        const resultItem = resultSelector(null, rightItem);

        // if result is null then probably a left item was modified
        result.push(resultItem || rightItem);
    }

    return result;
}

function verifyJoinArgs(
    leftArray: any[],
    rightArray: any[],
    leftKeySelector: (item: any) => string,
    rightKeySelector: (item: any) => string,
    resultSelector: (leftItem: any, rightItem: any) => any
): void {
    if (!leftArray || !Array.isArray(leftArray)) {
        throw Error('leftArray is not provided or not a valid')
    }
    if (!rightArray || !Array.isArray(rightArray)) {
        throw Error('rightArray is not provided or not a valid')
    }

    if (typeof leftKeySelector !== 'function') {
        throw Error('leftKeySelector is not provided or not a valid function')
    }

    if (typeof rightKeySelector !== 'function') {
        throw Error('rightKeySelector is not provided or not a valid function')
    }

    if (typeof resultSelector !== 'function') {
        throw Error('resultSelector is not provided or not a valid function')
    }
}

function leftOrInnerJoin(
    isInnerJoin: boolean,
    leftArray: any[],
    rightArray: any[],
    leftKeySelector: (item: any) => string,
    rightKeySelector: (item: any) => string,
    resultSelector: (leftItem: any, rightItem: any) => any
): any[] {

    verifyJoinArgs(leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);

    // build a lookup map
    const rightArrayMap = Object.create(null);
    for (let item of rightArray) {
        rightArrayMap[rightKeySelector(item)] = item;
    }

    const result: any[] = [];
    for (let leftItem of leftArray) {
        const leftKey = leftKeySelector(leftItem);
        const rightItem = rightArrayMap[leftKey] || null;

        if (isInnerJoin && !rightItem) { continue; }

        const resultItem = resultSelector(leftItem, rightItem);

        // if result is null then probably a left item was modified
        result.push(resultItem || leftItem);
    }

    return result;
}
