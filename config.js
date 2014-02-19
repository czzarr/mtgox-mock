var env = process.env.NODE_ENV || 'development';

config = {
  btcMultiple: 100000000, // 1e8
  btcSuffix: '\u00a0BTC',
  usdCurrency: 'USD',
  usdMultiple: 100000,  // 1e5
  usdPrefix: '$',
  MTGOX_HTTP_ENDPOINT: 'https://data.mtgox.com/api/2/BTCUSD/money/',
  MTGOX_SOCKETIO_ENDPOINT: 'https://socketio.mtgox.com/mtgox?Currency=USD',
  MTGOX_API_KEY: process.env.GOX_API_KEY,
  MTGOX_API_SECRET: process.env.GOX_API_SECRET,
  MTGOX_IDKEY: 'xxx',
  MTGOX_WEBSOCKET_CHANNELS: {
    trade: 'dbf1dee9-4f2e-4a08-8cb7-748919a71b21',
    depth: '24e67e0d-1cad-4cc0-9e7a-f8523ef460fe',
    ticker: 'd5f06780-30a8-4a48-a2f8-7ed181b4a13f'
  },
  MTGOX_PRIVATE_CHANNEL: 'yyyy',
  userAgent: 'Coffee-With-Redbull-Please',
  port: 3000,
  mongo: 'mongodb://localhost:27017/mtgox'
};

module.exports = config;
