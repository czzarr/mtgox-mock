var util = require('util')
var stream = require('stream')

module.exports = function () {
  util.inherits(Orderbook, stream.Transform);

  function Orderbook () {
    if (!(this instanceof Orderbook)) return new Orderbook();
    stream.Transform.call(this, { objectMode: true });
    this.ask;
    this.bid;
  }

  Orderbook.prototype._transform = function (chunk, encoding, done) {
    this.push(this.trade(chunk.trade));
    done();
  };

  Orderbook.prototype.add = function (order) {
    if (order.type === 'ask') {
      this.ask = order;
    } else if (order.type === 'bid') {
      this.bid = order;
    }
    this.push({ type: 'add', order: order });
  }

  Orderbook.prototype.cancel = function (orderId) {
    if (this.ask && this.ask.oid === orderId) {
      this.ask = null;
    } else if (this.bid && this.bid.oid === orderId) {
      this.bid = null;
    }
    this.push({ type: 'cancel', orderId: orderId });
  }

  Orderbook.prototype.trade = function (trade) {
    if (trade.trade_type === 'bid') {
      if (this.ask && trade.price_int >= this.ask.price_int) {
        if (this.ask.amount_int <= trade.amount_int) {
          var res = {
            result: 'order_completed',
            trade: trade,
            type: 'trade',
            order: this.ask
          };
          res.order.amount_int = '0'
          this.ask = null;
          return res
        } else {
          this.ask.amount_int -= trade.amount_int;
          return {
            result: 'order_partially_filled',
            trade: trade,
            type: 'trade',
            order: this.ask
          };
        }
      }
    }
    if (trade.trade_type === 'ask') {
      if (this.bid && trade.price_int <= this.bid.price_int) {
        if (this.bid.amount_int <= trade.amount_int) {
          var res = {
            result: 'order_completed',
            trade: trade,
            type: 'trade',
            order: this.bid
          };
          res.order.amount_int = '0'
          this.bid = null;
          return res;
        } else {
          this.bid.amount_int -= trade.amount_int;
          return {
            result: 'order_partially_filled',
            trade: trade,
            type: 'trade',
            order: this.bid
          };
        }
      }
    }
    return {
      trade: trade,
      type: 'trade'
    }
  }

  return new Orderbook()
}
