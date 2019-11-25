import { DataPipe } from "./data-pipe";

/**
 * Data Pipeline factory function what creates DataPipe
 * @param data Initial array
 * 
 * @example
 * dataPipe([1, 2, 3])
 */
export default function dataPipe<T = any>(data: T[]): DataPipe<T> {
  return new DataPipe<T>(data);
}
