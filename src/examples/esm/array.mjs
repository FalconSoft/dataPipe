import { groupBy, first, select, where, count } from 'datapipe-js/array';

const data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"}, { name: "Adam", country: "UK"},
  { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"}, { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
]

const groups = groupBy(data, i => i.country);
const list = select(groups, g => ({
    country: first(g).country,
    names: select(g, r => r.name).join(", "),
    count: count(g)
}));

const summaryForUS = where(list, r => r.country === "US");

console.log(summaryForUS);
