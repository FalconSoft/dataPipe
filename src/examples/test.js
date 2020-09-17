const { dataPipe } = require('datapipe-js');
const { avg } = require('datapipe-js/array');
const fetch = require('node-fetch');

async function main() {

    const dataUrl = "https://raw.githubusercontent.com/FalconSoft/sample-data/master/CSV/sample-testing-data-100.csv";
    const csv = await (await fetch(dataUrl)).text();

    return dataPipe()
        .fromCsv(csv)
        .groupBy(r => r.Country)
        .select(g => ({
            country: dataPipe(g).first().Country,
            sales: dataPipe(g).sum(i => i.Sales),
            avg: avg(g, i => i.Sales),
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
