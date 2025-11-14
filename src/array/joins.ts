import { Selector } from '../types';
import { fieldSelector } from '../_internals';

function verifyJoinArgs<TLeft, TRight, TResult>(
  leftArray: TLeft[],
  rightArray: TRight[],
  leftKeySelector: (item: TLeft) => string,
  rightKeySelector: (item: TRight) => string,
  resultSelector: (leftItem: TLeft | null, rightItem: TRight | null) => TResult
): void {
  if (!leftArray || !Array.isArray(leftArray)) {
    throw Error('leftArray is not provided or not a valid');
  }
  if (!rightArray || !Array.isArray(rightArray)) {
    throw Error('rightArray is not provided or not a valid');
  }

  if (typeof leftKeySelector !== 'function') {
    throw Error('leftKeySelector is not provided or not a valid function');
  }

  if (typeof rightKeySelector !== 'function') {
    throw Error('rightKeySelector is not provided or not a valid function');
  }

  if (typeof resultSelector !== 'function') {
    throw Error('resultSelector is not provided or not a valid function');
  }
}

function leftOrInnerJoin<TLeft, TRight, TResult>(
  isInnerJoin: boolean,
  leftArray: TLeft[],
  rightArray: TRight[],
  leftKey: string | string[] | Selector<TLeft, string>,
  rightKey: string | string[] | Selector<TRight, string>,
  resultSelector: (leftItem: TLeft | null, rightItem: TRight | null) => TResult
): TResult[] {
  const leftKeySelector = fieldSelector(leftKey);
  const rightKeySelector = fieldSelector(rightKey);

  verifyJoinArgs(leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);

  // build a lookup map
  const rightArrayMap: Record<string, TRight> = Object.create(null);
  for (const item of rightArray) {
    rightArrayMap[rightKeySelector(item)] = item;
  }

  const result: TResult[] = [];
  for (const leftItem of leftArray) {
    const leftKey = leftKeySelector(leftItem);
    const rightItem = rightArrayMap[leftKey] || null;

    if (isInnerJoin && !rightItem) {
      continue;
    }

    const resultItem = resultSelector(leftItem, rightItem);

    // if result is null then probably a left item was modified
    result.push((resultItem || leftItem) as TResult);
  }

  return result;
}

/**
 * leftJoin returns all elements from the left array (leftArray), and the matched elements from the right array (rightArray).
 * The result is NULL from the right side, if there is no match.
 * @param leftArray array for left side in a join
 * @param rightArray array for right side in a join
 * @param leftKey A key from left side array. What can be as a fieldName, multiple fields or key Selector
 * @param rightKey A key from right side array. what can be as a fieldName, multiple fields or key Selector
 * @param resultSelector A callback function that returns result value
 */
export function leftJoin<TLeft, TRight, TResult = TLeft>(
  leftArray: TLeft[],
  rightArray: TRight[],
  leftKeySelector: string | string[] | Selector<TLeft, string>,
  rightKeySelector: string | string[] | Selector<TRight, string>,
  resultSelector: (leftItem: TLeft | null, rightItem: TRight | null) => TResult
): TResult[] {
  return leftOrInnerJoin(
    false,
    leftArray,
    rightArray,
    leftKeySelector,
    rightKeySelector,
    resultSelector
  );
}

/**
 * innerJoin - Joins two arrays together by selecting elements that have matching values in both arrays.
 * If there are elements in any array that do not have matches in other array, these elements will not be shown!
 * @param leftArray array for left side in a join
 * @param rightArray array for right side in a join
 * @param leftKey A key from left side array. What can be as a fieldName, multiple fields or key Selector
 * @param rightKey A key from right side array. what can be as a fieldName, multiple fields or key Selector
 * @param resultSelector A callback function that returns result value
 */
export function innerJoin<TLeft, TRight, TResult = TLeft>(
  leftArray: TLeft[],
  rightArray: TRight[],
  leftKey: string | string[] | Selector<TLeft, string>,
  rightKey: string | string[] | Selector<TRight, string>,
  resultSelector: (leftItem: TLeft | null, rightItem: TRight | null) => TResult
): TResult[] {
  return leftOrInnerJoin(true, leftArray, rightArray, leftKey, rightKey, resultSelector);
}

/**
 * fullJoin returns all elements from the left array (leftArray), and all elements from the right array (rightArray).
 * The result is NULL from the right/left side, if there is no match.
 * @param leftArray array for left side in a join
 * @param rightArray array for right side in a join
 * @param leftKey A key from left side array. What can be as a fieldName, multiple fields or key Selector
 * @param rightKey A key from right side array. what can be as a fieldName, multiple fields or key Selector
 * @param resultSelector A callback function that returns result value
 */
export function fullJoin<TLeft, TRight, TResult = TLeft | TRight>(
  leftArray: TLeft[],
  rightArray: TRight[],
  leftKey: string | string[] | Selector<TLeft, string>,
  rightKey: string | string[] | Selector<TRight, string>,
  resultSelector: (leftItem: TLeft | null, rightItem: TRight | null) => TResult
): TResult[] {
  const leftKeySelector = fieldSelector(leftKey);
  const rightKeySelector = fieldSelector(rightKey);

  verifyJoinArgs(leftArray, rightArray, leftKeySelector, rightKeySelector, resultSelector);

  // build a lookup maps for both arrays.
  // so, both of them have to be unique, otherwise it will flattern result
  const leftArrayMap: Record<string, TLeft> = Object.create(null);
  for (const item of leftArray) {
    leftArrayMap[leftKeySelector(item)] = item;
  }

  const rightArrayMap: Record<string, TRight> = Object.create(null);
  for (const item of rightArray) {
    rightArrayMap[rightKeySelector(item)] = item;
  }

  const result: TResult[] = [];
  for (const leftItem of leftArray) {
    const leftKey = leftKeySelector(leftItem);
    const rightItem = rightArrayMap[leftKey] || null;

    const resultItem = resultSelector(leftItem, rightItem);

    // if result is null then probably a left item was modified
    result.push((resultItem || leftItem) as TResult);
    if (rightItem) {
      delete rightArrayMap[leftKey];
    }
  }

  // add remaining right items
  for (const rightItemKey in rightArrayMap) {
    const rightItem = rightArrayMap[rightItemKey];
    const resultItem = resultSelector(null, rightItem);

    // if result is null then probably a left item was modified
    result.push(resultItem || (rightItem as unknown as TResult));
  }

  return result;
}

/**
 * merges elements from two arrays. It appends source element or overrides to target array based on matching keys provided
 * @param targetArray target array
 * @param sourceArray source array
 * @param targetKey tartget key field, arry of fields or field serlector
 * @param sourceKey source key field, arry of fields or field serlector
 */
export function merge<TTarget, TSource>(
  targetArray: TTarget[],
  sourceArray: TSource[],
  targetKey: string | string[] | Selector<TTarget, string>,
  sourceKey: string | string[] | Selector<TSource, string>
): TTarget[] {
  const targetKeySelector = fieldSelector(targetKey);
  const sourceKeySelector = fieldSelector(sourceKey);
  verifyJoinArgs(targetArray, sourceArray, targetKeySelector, sourceKeySelector, () => false);

  // build a lookup maps for both arrays.
  // so, both of them have to be unique, otherwise it will flattern result
  const targetArrayMap: Record<string, TTarget> = Object.create(null);
  for (const item of targetArray) {
    targetArrayMap[targetKeySelector(item)] = item;
  }

  const sourceArrayMap: Record<string, TSource> = Object.create(null);
  for (const item of sourceArray) {
    sourceArrayMap[sourceKeySelector(item)] = item;
  }

  for (const sourceItemKey of Object.keys(sourceArrayMap)) {
    const sourceItem = sourceArrayMap[sourceItemKey];
    if (!targetArrayMap[sourceItemKey]) {
      targetArray.push(sourceItem as unknown as TTarget);
    } else {
      // merge properties in
      Object.assign(targetArrayMap[sourceItemKey], sourceItem);
    }
  }

  return targetArray;
}
