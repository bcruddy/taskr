const fetch = require('node-fetch');
const HOLDINGS = require('./crypto-holdings')

getPrices()
    .then(() => {
        process.exit(0);
    });

function getPrices () {
    const baseEndpoint = 'https://api.coinmarketcap.com/v1/ticker';
    const btc = fetch(`${baseEndpoint}/bitcoin`).then(r => r.json()),
        eth = fetch(`${baseEndpoint}/ethereum`).then(r => r.json()),
        ltc = fetch(`${baseEndpoint}/litecoin`).then(r => r.json()),
        xrp = fetch(`${baseEndpoint}/ripple`).then(r => r.json()),
        vtc = fetch(`${baseEndpoint}/vertcoin`).then(r => r.json()),
        iota = fetch(`${baseEndpoint}/iota`).then(r => r.json()),
        ada = fetch(`${baseEndpoint}/cardano`).then(r => r.json());

    return Promise.all([btc, eth, ltc, xrp, vtc, iota, ada])
        .then(buildPricingObject)
        .then(formatPricingData)
        .then(logPricing);
}

function buildPricingObject(data) {
    return data.reduce((memo, item) => {
        const {id, symbol, price_usd: price} = item[0];
        const currency = symbol.toLowerCase();

        memo[currency] = {
            symbol,
            price: parseFloat(price, 10).toFixed(symbol === 'BTC' ? 2 : 5),
            holdings: HOLDINGS[currency].toFixed(8),
            value: parseFloat(price * HOLDINGS[currency], 10).toFixed(2)
        };

        return memo;
    }, {});
}

function formatPricingData (info) {
    return Object.entries(info)
        .reduce((acc, [, currency]) => {
            let {symbol, price, holdings, value} = currency;

            if (symbol === 'MIOTA') {
                symbol = 'IOT';
            }

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
