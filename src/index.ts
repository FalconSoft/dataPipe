import { DataPipe } from "./data-pipe";

import * as arrayUtils from './array'
import * as utils from './utils'
import * as stringUtils from './string'

export { arrayUtils, utils, stringUtils };

/**
 * Data Pipeline factory function what creates DataPipe
 * @param data Initial array
 *
 * @example
 * dataPipe([1, 2, 3])
 */
export function dataPipe(data?: any[]): DataPipe {
  data = data || [];
  return new DataPipe(data);
}
