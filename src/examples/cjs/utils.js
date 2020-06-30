const { parseDatetimeOrNull, parseNumberOrNull, toTable, fromTable } = require('datapipe-js/utils');

console.log(parseDatetimeOrNull('10-10-2019'), parseNumberOrNull('0.45'));

const data = [
  { name: "John",  country: "US"}, { name: "Joe", country: "US"}, { name: "Bill",  country: "US"}, { name: "Adam", country: "UK"},
  { name: "Scott", country: "UK"}, { name: "Diana",country: "UK"}, { name: "Marry",country: "FR"}, { name: "Luc",country: "FR"}
]

const tableData = toTable(data);
console.log('Table format data: ', tableData);
console.log('Objects list format: ', fromTable(tableData));
