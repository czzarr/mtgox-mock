var Transform = require('stream').Transform;
var util = require('util');

util.inherits(Orderbook, Transform);

function Orderbook () {
  Transform.call(this);
  this._writableState.objectMode = true;
  this.ask;
  this.bid;
}

Orderbook.prototype._transform = function (chunk, encoding, done) {
  switch (chunk.type) {
    case 'order':
      var order = chunk.order;
      if (order.type === 'add') {
        this.add(chunk.order);
        //this.push('add');
        // TODO
        //this.push(user_order pending post pending executing open);
      }
      if (order.type === 'cancel') {
        this.cancel(chunk.orderId);
        //this.push('cancel');
        // TODO
        //this.push(user_order reason requested);
      }
      break;
    case 'trade':
        //this.push('trade');
        // TODO
        this.push(this.trade(chunk.trade));
      break;
  }
  done();
};

Orderbook.prototype.add = function (order) {
  if (order.type === 'ask') {
    this.ask = order;
  } else if (order.type === 'bid') {
    this.bid = order;
  }
}

Orderbook.prototype.cancel = function (orderId) {
  if (this.ask.oid === orderId) {
    this.ask = null;
  } else if (this.bid.oid === orderId) {
    this.bid = null;
  }
}

Orderbook.prototype.trade = function (trade) {
  if (trade.trade_type === 'bid') {
    if (this.ask && trade.price_int === this.ask.price_int) {
      if (this.ask.volume_int <= trade.volume_int) {
        this.ask = null;
        // TODO
        return { result: 'order_completed', trade: trade, type: 'trade', orderId: this.ask.oid };
      } else {
        this.ask.volume_int -= trade.volume_int;
        // TODO
        return { result: 'order_partially_filled', trade: trade, type: 'trade', orderId: this.ask.oid };
      }
    }
  }
  if (trade.trade_type === 'ask') {
    if (this.bid && trade.price_int === this.bid.price_int) {
      if (this.bid.volume_int <= trade.volume_int) {
        this.bid = null;
        // TODO
        this.emit('order_completed', trade);
      } else {
        this.bid.volume_int -= trade.volume_int;
        // TODO
        this.emit('order_partially_filled', trade);
      }
    }
  }
}

module.exports = Orderbook;
