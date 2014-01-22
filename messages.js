var mtgoxApiUtil = require('./mtgox-api-util');
var config = require('./config');

module.exports.subscribe = function (channel) { return { op: 'subscribe', channel: channel }; };
module.exports.unsubscribe = function (channel) { return { op: 'unsubscribe', channel: channel }; };

module.exports.private = {};

module.exports.private.wallet = {};
module.exports.private.wallet.in = function (amount_int) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'wallet',
    wallet: {
      op: 'in',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      //info: 'BTC bought: [tid:1373975198892772] 0.01000000 BTC at $98.20000',
      ref: null,
      balance: mtgoxApiUtil.btcAmount(options.balance_int)
    }
  };
};
module.exports.private.wallet.spent = function (amount_int) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'wallet',
    wallet: {
      op: 'spent',
      amount: mtgoxApiUtil.usdAmount(options.amount_int),
      //info: 'BTC bought: [tid:1373975198892772] 0.01000000 BTC at $98.20000',
      ref: null,
      balance: mtgoxApiUtil.usdAmount(options.balance_int)
    }
  };
};
module.exports.private.wallet.out = function (amount_int) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'wallet',
    wallet: {
      op: 'out',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      //info: 'BTC sold: [tid:1373975366587376] 0.01000000 BTC at $98.50000',
      ref: null,
      balance: mtgoxApiUtil.btcAmount(options.balance_int)
    }
  };
};
module.exports.private.wallet.earned = function (amount_int) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'wallet',
    wallet: {
      op: 'earned',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      //info: 'BTC sold: [tid:1373975366587376] 0.01000000 BTC at $98.50000',
      ref: null,
      balance: mtgoxApiUtil.btcAmount(options.balance_int)
    }
  };
};
module.exports.private.wallet.fee = function (amount_int, currency) {
  if (currency === 'BTC') {
    var amount = mtgoxApiUtil.btcAmount(options.amount_int);
    var balance = mtgoxApiUtil.btcAmount(options.balance_int);
  }
  if (currency === 'USD') {
    var amount = mtgoxApiUtil.usdAmount(options.amount_int);
    var balance = mtgoxApiUtil.usdAmount(options.balance_int);
  }
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'wallet',
    wallet: {
      op: 'fee',
      amount: amount_int,
      //info: 'BTC sold: [tid:1373975366587376] 0.01000000 BTC at $98.50000',
      ref: null,
      balance: balance_int
    }
  };
};

module.exports.private.trade = {};
module.exports.private.trade.public = function (trade) {
  return {
    channel: config.MTGOX_WEBSOCKET_CHANNELS.trade,
    op: 'private',
    origin: 'broadcast',
    private: 'trade',
    trade: trade
  };
};
module.exports.private.trade.private = function (trade) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'trade',
    trade: trade
  };
};

module.exports.private.user_order = {};
// TODO date, price, effective_amount, orderId
module.exports.private.user_order.pending = function (value_int, orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      currency: 'USD',
      status: 'pending',
      type: 'bid',
      item: 'BTC',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      effective_amount: mtgoxApiUtil.btcAmount(options.amount_int),
      date: Date.now(),
      price: mtgoxApiUtil.usdAmount(options.price_int)
    }
  };
};
module.exports.private.user_order.executing = function (value_int, orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      currency: 'USD',
      status: 'executing',
      type: 'bid',
      item: 'BTC',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      effective_amount: mtgoxApiUtil.btcAmount(options.amount_int),
      date: Date.now(),
      price: mtgoxApiUtil.usdAmount(options.price_int)
    }
  };
};
module.exports.private.user_order.post_pending = function (value_int, orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      currency: 'USD',
      status: 'post-pending',
      type: 'bid',
      item: 'BTC',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      effective_amount: mtgoxApiUtil.btcAmount(options.amount_int),
      date: Date.now(),
      price: mtgoxApiUtil.usdAmount(options.price_int)
    }
  };
};
module.exports.private.user_order.open = function (value_int, orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      currency: 'USD',
      status: 'open',
      type: 'bid',
      item: 'BTC',
      amount: mtgoxApiUtil.btcAmount(options.amount_int),
      effective_amount: mtgoxApiUtil.btcAmount(options.amount_int),
      date: Date.now(),
      price: mtgoxApiUtil.usdAmount(options.price_int)
    }
  };
};
module.exports.private.user_order.completed_passive = function (orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      reason: 'completed_passive'
    }
  };
};
module.exports.private.user_order.user_requested = function (orderId) {
  return {
    channel: config.MTGOX_PRIVATE_CHANNEL,
    op: 'private',
    origin: 'broadcast',
    private: 'user_order',
    user_order: {
      oid: orderId,
      reason: 'user_requested'
    }
  };
};
