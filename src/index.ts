import { DataPipe } from "./data-pipe";

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
