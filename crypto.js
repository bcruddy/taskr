const fetch = require('node-fetch');
const HOLDINGS = require('./crypto-holdings')

getPrices()
    .then(() => {
        process.exit(0);
    });

function getPrices () {
    const baseEndpoint = 'https://api.coinmarketcap.com/v1/ticker';
    const btc = fetch(`${baseEndpoint}/bitcoin`).then(r => r.json()),
        bch = fetch(`${baseEndpoint}/bitcoin-cash`).then(r => r.json()),
        eth = fetch(`${baseEndpoint}/ethereum`).then(r => r.json()),
        ltc = fetch(`${baseEndpoint}/litecoin`).then(r => r.json()),
        ada = fetch(`${baseEndpoint}/cardano`).then(r => r.json()),
        xrp = fetch(`${baseEndpoint}/ripple`).then(r => r.json()),
        trx = fetch(`${baseEndpoint}/tron`).then(r => r.json()),
        xlm = fetch(`${baseEndpoint}/stellar`).then(r => r.json());

    return Promise.all([btc, bch, eth, ltc, ada, xrp, xlm, trx])
        .then(buildPricingObject)
        .then(formatPricingData)
        .then(logPricing);
}

function buildPricingObject(data) {
    return data.reduce((memo, item) => {
        const {id, symbol, price_usd: price, rank} = item[0];
        const currency = symbol.toLowerCase();

        if (!HOLDINGS[currency]) {
            return memo;
        }

        memo[currency] = {
            symbol,
            rank,
            price: parseFloat(price, 10).toFixed(symbol === 'BTC' ? 2 : 5),
            holdings: HOLDINGS[currency].toFixed(8),
            value: parseFloat(price * HOLDINGS[currency], 10).toFixed(2),
        };

        return memo;
    }, {});
}

function formatPricingData (info) {
    return Object.entries(info)
        .sort((a, b) => parseInt(a[1].rank, 10) > parseInt(b[1].rank, 10) ? 1 : -1)
        .reduce((acc, [, currency]) => {
            let {symbol, price, holdings, value, rank} = currency;

            if (value < 5) {
                return acc;
            }

            if (symbol === 'STRAT') {
                symbol = 'STR';
            }

            acc.list.push(`${symbol} ${rank}\t$${price}\t${holdings}\t$${value}`);
            acc.sum += parseFloat(value, 10);

            return acc;
        }, {sum: 0, list: []});
}

function logPricing ({list, sum}) {
    console.log(`${new Date()}\n`);
    console.log(
        list.join('\n').trim(),
        `\n\t\t\t\t\t--------`,
        `\n\t\t\t\t\t$${sum.toFixed(2)}`
    );
}
