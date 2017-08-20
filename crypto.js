const fetch = require('node-fetch');

const btc = fetch('https://api.gemini.com/v1/pubticker/btcusd').then(r => r.json());
const eth = fetch('https://api.gemini.com/v1/pubticker/ethusd').then(r => r.json());
const ltc = fetch('https://api.cryptonator.com/api/ticker/ltc-usd').then(r => r.json());

Promise.all([btc, eth, ltc])
    .then(([btc, eth, ltc]) => {
        console.log(
            `BTC: $${btc.last}`,
            `\nETH: $${eth.last}`,
            `\nLTC: $${parseFloat(ltc.ticker.price, 10).toFixed(2)}`
        );

        process.exit(0);
    });
