# dataPipe

(WIP)

dataPipe is data transformation and analytical library inspired by LINQ (C#) and Pandas - (Python). It provides a facilities for data loading, data transformation and other helpful data manipulation functions. Originally DataPipe project was created to power [JSPython](https://github.com/jspython-dev/jspython) and [Worksheet Systems](https://worksheet.systems) related projects, but it is also a can be used as a standalone library for your data-driven JavaScript or JSPython applications on both the client (web browser) and server (NodeJS).

## Get started

A quick way to use it in html

```
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/datapipe-js/dist/data-pipe.min.js"></script>
```

or npm

```
npm install datapipe-js
```

## A quick example
JavaScript / TypeScript
```js
import { dataPipe } from 'datapipe-js';
import * as dpString from 'datapipe-js/string';
import * as dpUtils from 'datapipe-js/utils';
import * as dpArray from 'datapipe-js/array';

const data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"},
  { name: "Adam", country: "UK"}, { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"},
  { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
];

const summaryForUS = dataPipe(data)
  .groupBy(i => i.country)
  .select(g => 
    r = {
      country: dataPipe(g).first().country,
      names: dataPipe(g).map(r => r.name).join(", "),
      count: dataPipe(g).count()
    };
    return r
  )
  .where(r => r.country != "US")
  .toArray();
  
  console.log(summaryForUS);
```

[JSPython](https://jspython.dev) inside [Worksheet Systems](https://worksheet.systems) Application.
```py
from datapipe-js import dataPipe
from datapipe-js-array import first, sum

data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"}, { name: "Adam", country: "UK"}, 
  { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"}, { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
]

summaryForUS = dataPipe(data)
  .groupBy(i => i.country)
  .select(g => 
    r = {
      country: dataPipe(g).first().country,
      names: dataPipe(g).map(r => r.name).join(", "),
      count: dataPipe(g).count()
    }
    return r
  )
  .where(r => r.country != "US")
  .toArray()
 
 print(summaryForUS)

```


## Data management functions

### Data Loading

Loading and parsing data from a common file formats like: CSV, JSON, TSV either from local variable, http endpoints or local file system (NodeJS only)
 
 - **dataPipe**(array) - accepts a JavaScript array
 - **fromTable**(rows, fields [, dataTypes]) - load data from two dimentional array (rows) and array for field names (fields). And if dataTypes are supplied it will automatically parse data types - Date, numbers, booleans
 - **fromCsv**(contentOrUrlOrPath[, options]) - it loads a string content or external URL or file system path (NodeJS only) and process each row with optional but robust configuration options and callbacks e.g. skipRows, skipUntil, takeWhile, rowSelector, rowPredicate etc.

### Data Transformation

 - **select**(elementSelector) synonym **map** - creates a new element for each element in a pipe based on elementSelector callback.
 - **where**(predicate) / **filter** - filters elements in a pipe based on predicate
 - **groupBy**(keySelector) - groups elements in a pipe according to the keySelector callback-function. Returns a pipe with new group objects.
 - **pivot**(array, rowFields, columnField, dataField, aggFunction?, columnValues?) - Returns a reshaped (pivoted) array based on unique column values.
 - **transpose**(array) - Transpose rows to columns in an array
 - **innerJoin**(leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selecting elements that have matching values in both arrays. The array elements that do not have matche in one array will not be shown!
 - **leftJoin**(leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selrcting all elements from the left array (leftArray), and the matched elements from the right array (rightArray). The result is NULL from the right side, if there is no match.
 - **fullJoin**(leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selrcting all elements from the left array (leftArray), and the matched elements from the right array (rightArray). The result is NULL from the right side, if there is no match.
 - **fullJoin**(leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selrcting all elements from the left array (leftArray), and then all elements from the right array (rightArray). The result element could be NULL oneither side - right or left side, if there is no match.
 - **merge**(targetArray, sourceArray, targetKey, sourceKey) - merges elements from two arrays. It takes source elements and append or override elements in the target array.Merge or append is based on matching keys provided

### Aggregation and other numerical functions

 - [**avg**](https://falconsoft.github.io/dataPipe/classes/_data_pipe_.datapipe.html#avg)([propertySelector, predicate]) synonym **average** - returns an average value for a gived array. With `propertySelector` you can choose the property to calculate average on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - **max**([propertySelector, predicate]) synonym **maximum** - returns a maximum value for a gived array. With `propertySelector` you can choose the property to calculate maximum on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - **min**([propertySelector, predicate]) synonym **minimum** - returns a minimum value for a gived array. With `propertySelector` you can choose the property to calculate minimum on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - **count**([predicate]) - returns the count for an elements in a pipe. With `predicate` function you can specify criteria
 - **first**([predicate]) - returns a first element in a pipe. If predicate function provided. Then it will return the first element in a pipe for a given criteria.
 - **last**([predicate]) - returns a first element in a pipe. If predicate function provided. Then it will return the first element in a pipe for a given criteria.
 - **mean**(array, [propertySelector]) - returns a mean in array.
 - **quantile**(array, [propertySelector]) - returns a quantile in array.
 - **variance**(array, [propertySelector]) - returns a sample variance of an array.
 - **stdev**(array, [propertySelector]) - returns a standard deviation in array.
 - **median**(array, [propertySelector]) - returns a median in array.
 
### Output your pipe data to

 - **toArray**() - output your pipe result into JavaScript array.
 - **toMap**(keySelector, valueSelector) - output your pipe result into JavaScript Map object, based of key and value selectors.
 - **toObject**(nameSelector, valueSelector) - output your pipe result into JavaScript object, based of name and value selectors.
 - **toCsv**() - output your pipe result into string formated as CSV
 - **toTsv**() - output your pipe result into string formated as TSV
 - **toFile**(filePath, format: 'csv' | 'tsv' | 'json' | 'json-min' = 'csv') - Output your pipe data to the file in a specified format (default CSV). It will save you data to the file when in NodeJS or downloads when in browser.

### Other helpful utilities for working with data in JavaScript or JSPython
 - **parseDate**(dateString[, formats]) - a bit wider date time parser than JS's `parseDate()`. Be aware. It gives UK time format (dd/MM/yyyy) a priority! e.g. '8/2/2019' will be parsed to 8th of February 2019
 - **dateToString**(date) - converts date to string without applying time zone. It returns ISO formated date with time (if time present). Otherwise it will return just a date - yyyy-MM-dd

## License
A permissive [MIT](https://github.com/FalconSoft/dataPipe/blob/master/LICENSE) (c) - FalconSoft Ltd

 
