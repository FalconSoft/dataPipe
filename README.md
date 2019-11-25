# dataPipe

dataPipe is data transformation and analytical library inspired by LINQ (C#) and Pandas - (Python)

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

## methods (Pretty much WIP. Do not use it until v0.1)
 - select / map
 - filter / where
 - dropColumns([])

 - orderBy()
 - thenBy()
 - orderByDescending()
 - thenByDescending()

 - groupBy(keySelector)
 - join(array2, keySelector1, keySelector2, resultProjector)
 - join(separator) - string style concatenation
 - intercept()
 - except()
 - pivot()
 - merge()
 - union / concat()

 - avg / average (predicate)
 - max / maximum (predicate)
 - min / minimum (predicate)
 - count(predicate)
 - first(predicate)
 - last(predicate)

 - toArray()
 - toMap(keySelector, valueSelector)
 - toObject(nameSelector, valueSelector)
 - toCsv()
 - toTsv() 
 

 
