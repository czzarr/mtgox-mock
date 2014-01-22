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
        this.socket.volatile.emit('message', messages.private.user_order.pending(chunk.order));
        this.socket.volatile.emit('message', messages.private.user_order.executing(chunk.order));
        this.socket.volatile.emit('message', messages.private.user_order.post_pending(chunk.order));
        this.socket.volatile.emit('message', messages.private.user_order.open(chunk.order));
        this.socket.volatile.emit('message', messages.private.user_order.open(chunk.order));
        break;
      case 'cancel':
        this.socket.volatile.emit('message', messages.private.user_order.user_requested(orderId));
        break;
      case 'trade':
        var trade = chunk.trade;
        if (trade.trade_type === 'bid') {
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.out(trade.amount_int));
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.earned(trade.amount_int));
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.fee(trade.amount_int, trade.price_currency));
          this.socket.volatile.emit('message', messages.private.trade.public(trade));
          this.socket.volatile.emit('message', messages.private.trade.private(trade));
          // TODO missing price, orderId arg
          this.socket.volatile.emit('message', messages.private.user_order.open(trade));
          // TODO missing orderId arg
          this.socket.volatile.emit('message', messages.private.user_order.completed_passive());
        }
        if (trade.trade_type === 'ask') {
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.in(trade.amount_int));
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.spent(trade.amount_int));
          // TODO missing balance_int arg
          this.socket.volatile.emit('message', messages.private.wallet.fee(trade.amount_int, 'BTC'));
          this.socket.volatile.emit('message', messages.private.trade.public(trade));
          this.socket.volatile.emit('message', messages.private.trade.private(trade));
          this.socket.volatile.emit('message', messages.private.user_order.open(trade));
          this.socket.volatile.emit('message', messages.private.user_order.completed_passive());
        }
        break;
    }
    done();
  }
  return ss;
};
