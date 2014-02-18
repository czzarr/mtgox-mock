var Writable = require('stream').Writable;
var util = require('util');
var messages = require('./messages');

module.exports = function (socket) {
  util.inherits(SocketStream, Writable);
  function SocketStream (socket) {
    Writable.call(this, { objectMode: true });
    this.socket = socket;
  }
  var ss = new SocketStream(socket);
  ss._write = function (chunk, encoding, done) {
    switch (chunk.type) {
      case 'add':
        var order = chunk.order
        this.socket.volatile.emit('message', messages.private.user_order.pending(order));
        this.socket.volatile.emit('message', messages.private.user_order.executing(order));
        this.socket.volatile.emit('message', messages.private.user_order.post_pending(order));
        this.socket.volatile.emit('message', messages.private.user_order.open(order));
        this.socket.volatile.emit('message', messages.private.user_order.open(order));
        break;
      case 'cancel':
        this.socket.volatile.emit('message', messages.private.user_order.user_requested(chunk.orderId));
        break;
      case 'trade':
        var trade = chunk.trade
        var order = chunk.order
        // if it's a public trade that doesn't hit us order will be
        // undefined
        if (order) {
          if (trade.trade_type === 'bid') {
            this.socket.volatile.emit('message', messages.private.wallet.out(trade.amount_int));
            this.socket.volatile.emit('message', messages.private.wallet.earned(trade.amount_int));
            this.socket.volatile.emit('message', messages.private.wallet.fee(trade.amount_int, trade.price_currency));
          }
          if (trade.trade_type === 'ask') {
            this.socket.volatile.emit('message', messages.private.wallet.in(trade.amount_int));
            this.socket.volatile.emit('message', messages.private.wallet.spent(trade.amount_int));
            this.socket.volatile.emit('message', messages.private.wallet.fee(trade.amount_int, 'BTC'));
          }
          this.socket.volatile.emit('message', messages.private.trade.public(trade));
          this.socket.volatile.emit('message', messages.private.trade.private(trade));
          this.socket.volatile.emit('message', messages.private.user_order.open(order));
          if (order.amount_int === '0') this.socket.volatile.emit('message', messages.private.user_order.completed_passive(order.oid));
        } else {
          this.socket.volatile.emit('message', messages.private.trade.public(trade));
        }
        break;
    }
    done();
  }
  return ss;
};
