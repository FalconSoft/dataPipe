# dataPipe

dataPipe is a data processing and data analytics library for JavaScript. Inspired by LINQ (C#) and Pandas (Python). It provides a facilities for data loading, data transformation, data analysis and other helpful data manipulation functions. 

Originally DataPipe project was created to power [JSPython](https://github.com/jspython-dev/jspython) and [Worksheet Systems](https://worksheet.systems) related projects, but it is also can be used as a standalone library for your data-driven JavaScript or JSPython applications on both the client (web browser) and server (NodeJS).

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

[StackBlitz example](https://stackblitz.com/edit/datapipe-js-examples?file=index.js)

```js
const { dataPipe, avg, first } = require('datapipe-js');
const fetch = require('node-fetch');

async function main() {

    const dataUrl = "https://raw.githubusercontent.com/FalconSoft/sample-data/master/CSV/sample-testing-data-100.csv";
    const csv = await (await fetch(dataUrl)).text();

    return dataPipe()
        .fromCsv(csv)
        .groupBy(r => r.Country)
        .select(g => ({
            country: first(g).Country,
            sales: dataPipe(g).sum(i => i.Sales),
            averageSales: avg(g, i => i.Sales),
            count: g.length
        })
        )
        .where(r => r.sales > 5000)
        .sort("sales DESC")
        .toArray();
}

main()
    .then(console.log)
    .catch(console.error)
```

## Data management functions

All utlity functions can be used as a chaining (pipe) methods as well as a separately. In an example you will notice that to sum up `sales` we created a new dataPipe, but for an `averageSales` we used just a utility method `avg`. 

### Data Loading

Loading and parsing data from a common file formats like: CSV, JSON, TSV either from local variable

 - [**dataPipe**](https://www.datapipe-js.com/docs/datapipe#datapipe) (array) - accepts a JavaScript array
 
- [**fromTable**](https://www.datapipe-js.com/docs/datapipe-js-utils#fromtable) (table) - converts a rows and columns list into array of sclalar objects

 - [**parseCsv**](https://www.datapipe-js.com/docs/datapipe-js-utils#parsecsv) (csvContent[, options]) - it loads a string content and process each row with optional but robust configuration options and callbacks e.g. skipRows, skipUntil, takeWhile, rowSelector, rowPredicate etc. This will automatically convert all types to numbers, datetimes or booleans if otherwise is not specified

### Data Transformation

 - [**select**](https://www.datapipe-js.com/docs/datapipe-js-array#select) (elementSelector) synonym **map** - creates a new element for each element in a pipe based on elementSelector callback.
 - [**where**](https://www.datapipe-js.com/docs/datapipe-js-array#where) (predicate) / **filter** - filters elements in a pipe based on predicate
 - [**groupBy**](https://www.datapipe-js.com/docs/datapipe-js-array#groupby) (keySelector) - groups elements in a pipe according to the keySelector callback-function. Returns a pipe with new group objects.
 - [**pivot**](https://www.datapipe-js.com/docs/datapipe-js-array#pivot) (array, rowFields, columnField, dataField, aggFunction?, columnValues?) - Returns a reshaped (pivoted) array based on unique column values.
 - [**transpose**](https://www.datapipe-js.com/docs/datapipe-js-array#transpose) (array) - Transpose rows to columns in an array
 - [**sort**](https://www.datapipe-js.com/docs/datapipe-js-array#sort) ([fieldName(s)]) - Sort array of elements according to a field and direction specified. e.g. sort(array, 'name ASC', 'age DESC')

### Joining data arrays

 - [**innerJoin**](https://www.datapipe-js.com/docs/datapipe-js-array#innerjoin) (leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selecting elements that have matching values in both arrays. The array elements that do not have matche in one array will not be shown!
 - [**leftJoin**](https://www.datapipe-js.com/docs/datapipe-js-array#leftjoin) (leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selrcting all elements from the left array (leftArray), and the matched elements from the right array (rightArray). The result is NULL from the right side, if there is no match.
 - [**fullJoin**](https://www.datapipe-js.com/docs/datapipe-js-array#fulljoin) (leftArray, rightArray, leftKey, rightKey, resultSelector) - Joins two arrays together by selrcting all elements from the left array (leftArray), and the matched elements from the right array (rightArray). The result is NULL from the right side, if there is no match.
 - [**merge**](https://www.datapipe-js.com/docs/datapipe-js-array#merge) (targetArray, sourceArray, targetKey, sourceKey) - merges elements from two arrays. It takes source elements and append or override elements in the target array.Merge or append is based on matching keys provided


### Aggregation and other numerical functions

 - [**avg**](https://www.datapipe-js.com/docs/datapipe-js-array#avg) ([propertySelector, predicate]) synonym **average** - returns an average value for a gived array. With `propertySelector` you can choose the property to calculate average on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - [**max**](https://www.datapipe-js.com/docs/datapipe-js-array#max) ([propertySelector, predicate]) synonym **maximum** - returns a maximum value for a gived array. With `propertySelector` you can choose the property to calculate maximum on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - [**min**](https://www.datapipe-js.com/docs/datapipe-js-array#min) ([propertySelector, predicate]) synonym **minimum** - returns a minimum value for a gived array. With `propertySelector` you can choose the property to calculate minimum on. And with `predicate` you can filter elements if needed. Both properties are optional.
 - [**count**](https://www.datapipe-js.com/docs/datapipe-js-array#count) ([predicate]) - returns the count for an elements in a pipe. With `predicate` function you can specify criteria
 - [**first**](https://www.datapipe-js.com/docs/datapipe-js-array#first) ([predicate]) - returns a first element in a pipe. If predicate function provided. Then it will return the first element in a pipe for a given criteria.
 - [**last**](https://www.datapipe-js.com/docs/datapipe-js-array#last) ([predicate]) - returns a first element in a pipe. If predicate function provided. Then it will return the first element in a pipe for a given criteria.
 - [**mean**](https://www.datapipe-js.com/docs/datapipe-js-array#mean) (array, [propertySelector]) - returns a mean in array.
 - [**quantile**](https://www.datapipe-js.com/docs/datapipe-js-array#quantile) array, [propertySelector]) - returns a quantile in array.
 - [**variance**](https://www.datapipe-js.com/docs/datapipe-js-array#variance) (array, [propertySelector]) - returns a sample variance of an array.
 - [**stdev**](https://www.datapipe-js.com/docs/datapipe-js-array#stdev) (array, [propertySelector]) - returns a standard deviation in array.
 - [**median**](https://www.datapipe-js.com/docs/datapipe-js-array#median) (array, [propertySelector]) - returns a median in array.
 
### Output your pipe data to

 - [**toArray**](https://www.datapipe-js.com/docs/datapipe-js-utils#toarray) - output your pipe result into JavaScript array.
 - [**toObject**](https://www.datapipe-js.com/docs/datapipe-js-utils#toobject) (nameSelector, valueSelector) - output your pipe result into JavaScript object, based of name and value selectors.
 - [**toSeries**](https://www.datapipe-js.com/docs/datapipe-js-utils#toseries) (propertyNames) - convert array into an object of series.
 - [**toCsv**](https://www.datapipe-js.com/docs/datapipe-js-utils#tocsv) ([delimiter]) - output pipe result into string formated as CSV
when in browser.


### Other helpful utilities for working with data in JavaScript or JSPython
 - [**parseDatetimeOrNull**](https://www.datapipe-js.com/docs/datapipe-js-utils#parsedatetimeornull) (dateString[, formats]) - a bit wider date time parser than JS's `parseDate()`. Be aware. It gives UK time format (dd/MM/yyyy) a priority! e.g. '8/2/2019' will be parsed to 8th of February 2019
 - [**dateToString**](https://www.datapipe-js.com/docs/datapipe-js-utils#datetostring) (date, format) - converts date to string without applying time zone. It returns ISO formated date with time (if time present). Otherwise it will return just a date - yyyy-MM-dd
 - [**parseNumberOrNull**](https://www.datapipe-js.com/docs/datapipe-js-utils#parsenumberornull) (value: string | number): convert to number or returns null
 - [**parseBooleanOrNull**](https://www.datapipe-js.com/docs/datapipe-js-utils#parsebooleanornull) (val: boolean | string): convert to Boolean or returns null. It is treating `['1', 'yes', 'true', 'on']` as true and `['0', 'no', 'false', 'off']` as false 
 - [**deepClone**](https://www.datapipe-js.com/docs/datapipe-js-utils#deepclone) returns a deep copy of your object or array.
 - [**getFieldsInfo**](https://www.datapipe-js.com/docs/datapipe-js-utils#getfieldsinfo) (items: Record<string, ScalarType>[]): FieldDescription[] : Generates a field descriptions (first level only) from array of items. That eventually can be used for relational table definition. If any properties are Objects, it would use JSON.stringify to calculate maxSize field.
- [**addDays**](https://www.datapipe-js.com/docs/datapipe-js-utils#adddays) (date: Date, daysOffset: number): Date:  add days to the current date. `daysOffset` can be positive or negative number
- [**addBusinessDays**](https://www.datapipe-js.com/docs/datapipe-js-utils#addbusinessdays) (date: Date, bDaysOffset: number): Date:  Worksout a business date (excludes Saturdays and Sundays) based on bDaysOffset count. `bDaysOffset` can be positive or negative number.

### String Utils
 - [**replaceAll**](https://www.datapipe-js.com/docs/datapipe-js-string#replaceall) (text, searchValue, replaceValue) - Replace all string function
 - [**formatCamelStr**](https://www.datapipe-js.com/docs/datapipe-js-string#formatcamelstr) (text) - Formats string to the Camel Case
 - [**trimStart**](https://www.datapipe-js.com/docs/datapipe-js-string#trimstart) (text, charactersToTrim) - Trims characters from the start
 - [**trimEnd**](https://www.datapipe-js.com/docs/datapipe-js-string#trimend) (text, charactersToTrim) - Trims characters at the end
 - [**trim**](https://www.datapipe-js.com/docs/datapipe-js-string#trim) (text, charactersToTrim) - Trims characters in both sides
 - [**split**](https://www.datapipe-js.com/docs/datapipe-js-string#split) (text, separator, brackets): string - Splits text into tokens. Also, it supports multiple separators and will respect open/close brackets. e.g. `split('field1=func(a,b,c),field2=4', ',', ['()'])` will result into `["field1=func(a,b,c)", "field2=4"]`
 

## License
A permissive [MIT](https://github.com/FalconSoft/dataPipe/blob/master/LICENSE) (c) - FalconSoft Ltd

 
