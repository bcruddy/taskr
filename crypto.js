const fetch = require('node-fetch');
const HOLDINGS = require('./crypto-holdings')

getPrices()
    .then(() => {
        process.exit(0);
    });

function getPrices () {
    const baseEndpoint = 'https://api.cryptonator.com/api/ticker';
    const btc = fetch(`${baseEndpoint}/btc-usd`).then(r => r.json()),
        eth = fetch(`${baseEndpoint}/eth-usd`).then(r => r.json()),
        ltc = fetch(`${baseEndpoint}/ltc-usd`).then(r => r.json()),
        xrp = fetch(`${baseEndpoint}/xrp-usd`).then(r => r.json()),
        vtc = fetch(`${baseEndpoint}/vtc-usd`).then(r => r.json()),
        iota = fetch(`${baseEndpoint}/iot-usd`).then(r => r.json());

    return Promise.all([btc, eth, ltc, xrp, vtc, iota])
        .then(buildPricingObject)
        .then(formatPricingData)
        .then(logPricing);
}

function buildPricingObject([btc, eth, ltc, xrp, vtc, iota]) {
    return {
        btc: {
            symbol: 'BTC',
            price: parseFloat(btc.ticker.price, 10).toFixed(2),
            holdings: HOLDINGS.btc.toFixed(8),
            value: parseFloat(btc.ticker.price * HOLDINGS.btc, 10).toFixed(2)
        },
        eth: {
            symbol: 'ETH',
            price: parseFloat(eth.ticker.price, 10).toFixed(2),
            holdings: HOLDINGS.eth.toFixed(8),
            value: parseFloat(eth.ticker.price * HOLDINGS.eth, 10).toFixed(2)
        },
        ltc: {
            symbol: 'LTC',
            price: parseFloat(ltc.ticker.price, 10).toFixed(2),
            holdings: HOLDINGS.ltc.toFixed(8),
            value: parseFloat(ltc.ticker.price * HOLDINGS.ltc, 10).toFixed(2)
        },
        xrp: {
            symbol: 'XRP',
            price: parseFloat(xrp.ticker.price, 10).toFixed(5),
            holdings: HOLDINGS.xrp.toFixed(6),
            value: parseFloat(xrp.ticker.price * HOLDINGS.xrp, 10).toFixed(2)
        },
        vtc: {
            symbol: 'VTC',
            price: parseFloat(vtc.ticker.price, 10).toFixed(5),
            holdings: HOLDINGS.vtc.toFixed(7),
            value: parseFloat(vtc.ticker.price * HOLDINGS.vtc, 10).toFixed(2)
        },
        iota: {
            symbol: 'IOTA',
            price: parseFloat(iota.ticker.price, 10).toFixed(5),
            holdings: HOLDINGS.iota.toFixed(6),
            value: parseFloat(iota.ticker.price * HOLDINGS.iota, 10).toFixed(2)
        }
    };
}

function formatPricingData (info) {
    return Object.entries(info)
        .reduce((acc, [, currency]) => {
            const {symbol, price, holdings, value} = currency;

            acc.list.push(`${symbol}: $${price}\t${holdings}\t$${value}`);
            acc.sum += parseFloat(value, 10);

            return acc;
        }, { sum: 0, list: []});
}

function logPricing ({list, sum}) {
    console.log(
        list.join('\n'),
        `\n\t\t\t\t--------`,
        `\n\t\t\t\t$${sum.toFixed(2)}`
    );
}
