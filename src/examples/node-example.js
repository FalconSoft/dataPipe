const dataPipe = require("../../lib/data-pipe.umd").dataPipe;

const data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"}, { name: "Adam", country: "UK"},
  { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"}, { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
]

const summaryForUS = dataPipe(data)
  .groupBy(i => i.country)
  .select(g => {
    const r = {}
    r.country = dataPipe(g).first().country
    r.names = dataPipe(g).map(r => r.name).join(", ")
    r.count = dataPipe(g).count()
    return r;
  })
  .where(r => r.country === "US")
  .toArray()

  console.log(summaryForUS);
