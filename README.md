# dataPipe

dataPipe is data transformation and analytical library inspired by LINQ (C#) and Pandas - (Python). It provides facilities for data loading, data transformation and other data utility functions. Originally DataPipe project was created to power [JSPython](https://github.com/jspython-dev/jspython) and [Worksheet Systems](https://worksheet.systems) related projects, but it is also a can be used as standalone library for your data-driven JavaScript or JSPython applications on both the client (web browser) and server (NodeJS)

## Get started

A quick way to use it in html

```
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/datapipe-js@0.0.4/dist/datapipe-js.min.js">
</script>
```

or npm

```
npm install datapipe-js
```

## A quick example

```js
const data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"}, { name: "Adam", country: "UK"}, 
  { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"}, { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
]

const summaryForUS = dataPipe(data)
  .groupBy(i => i.country)
  .select(g => 
    r = {}
    r.country = dataPipe(g).first().country
    r.names = dataPipe(g).map(r => r.name).join(", ")
    r.count = dataPipe(g).count()
    r
  )
  .where(r => r.country != "US")
  .toArray()
```

## Functionality

### Data Loading
Loading and parsing data from a common file formats like: CSV, JSON, TSV either from local variable, http endpoints or local file system (NodeJS only)
 
 - **dataPipe**(array) - accepts a JavaScript array
 - **fromTable**(rows, fields [, dataTypes]) - load data from two dimentional array (rows) and array for field names (fields). And if dataTypes are supplied it will automatically parse data types - Date, numbers, booleans
 - **fromCsv**(contentOrUrlOrPath[, options]) - it loads a string content or external URL or file system path (NodeJS only) and process each row with optional but robust configuration options and callbacks e.g. skipRows, skipUntil, takeWhile, rowSelector, rowPredicate etc.

### Data Transformation

 - **select** / map
 - **where** / filter
 - **groupBy**
 - **join**(array2, keySelector1, keySelector2, resultProjector)
 - **join**(separator) - string style concatenation
 - **intercept**()
 - **except**()
 - **pivot**()
 - **merge**()
 - **union** / concat()

### Aggregation functions

 - **avg** / average (predicate)
 - **max** / maximum (predicate)
 - **min** / minimum (predicate)
 - **count**(predicate)
 - **first**(predicate)
 - **last**(predicate)
 
### Output your pipe data to

 - **toArray**() - output your pipe result into JavaScript array.
 - **toMap**(keySelector, valueSelector) - output your pipe result into JavaScript Map object, based of key and value selectors.
 - **toObject**(nameSelector, valueSelector) - output your pipe result into JavaScript object, based of name and value selectors.
 - **toCsv**() - output your pipe result into string formated as CSV
 - **toTsv**() - output your pipe result into string formated as TSV
 - **toFile**(filePath, format: 'csv' | 'tsv' | 'json' | 'json-min' = 'csv') - Output your pipe to file in a specified format. It will save you data to the file when in NodeJS or downloads when in browser.

### Other helpful utilities for working with data in JavaScript or JSPython
 - **parseDate**
 - **dateToString** - converts date to string without applying time zone


## methods (Pretty much WIP. Do not use it until v0.1)
 

 
