var stream = require('stream');
var log = require('./logger');
var usdMultiple = require('./config').usdMultiple;

module.exports = createFisherStream;

function createFisherStream (options) {
  return new Fisher(options);
}

Fisher.prototype = Object.create(stream.Transform.prototype, { constructor: Fisher });

function Fisher (options) {
  stream.Transform.call(this, { objectMode: true });

  // algorithm parameters
  this._aimAmount = 0.1 * usdMultiple;
  this._giveAway = 0.0039;
  this._lossStep = 0.033;
  this._profitStep = 0.02;
  this._profitAim = this._profitStep - this._giveAway; // 0.0161
  this._limitPriceTolerance = 0.1 * this._profitAim; // 0.00161

  this.state = 0;
  this.waiting = false;
  this.count = 0;

  this.best_bid = options.bestBid;
  this.best_ask = options.bestAsk;

  this.balance = options.balance;
  this.fee = options.fee;
  this.position = { bought: 0, sold: 0 };

  this.bid;
  this.ask;
}

Fisher.prototype._transform = function (chunk, encoding, done) {
  var message = this.processMessage(chunk);
  //log.info({ msg: message });
  if (message.type) {
    console.log('====type====', message.type);
    var sig;
    console.log('====state====', this.state);
    switch (this.state) {
      case 0:
        // TODO move this case up so that we don't wait for a trade
        this.bid = this.getFisherOrder('bid');
        this.ask = this.getFisherOrder('ask');
        console.log(this.bid);
        console.log(this.ask);
        sig = { bid: this.bid, ask: this.ask };
        this.state = 1;
        break;
      case 1:
        switch (message.type) {
          case 'hit':
            sig = { cancel: [this.bid.oid, this.ask.oid] };
            this.waiting = true;
            this.hit = true;
            break;
          case 'orderEnd':
            if (this.hit) {
              this.count += 1;
              if (this.count === 2) {
                this.count = 0;
                this.state = 2;
                this.hit = false;
                this.waiting = false;
                // place hedge order
                var position = this.getPosition();
                if (position > 0) {
                  this.ask = this.getHedgeOrder('ask');
                  this.bid = undefined;
                  sig = { ask: this.ask };
                } else if (position < 0) {
                  this.bid = this.getHedgeOrder('bid');
                  this.ask = undefined;
                  sig = { bid: this.bid };
                } else if (position === 0) {
                  this.state = 0;
                  this.ask = undefined;
                  this.bid = undefined;
                }
              }
            } else {
              this.waiting = false;
              // place new order
              var type = message.chunk.user_order.type === 'ask' ? 'ask' : 'bid';
              this[type] = this.getFisherOrder(type);
              sig[type] = this[type];
            }
            break;
          case 'trade':
            var trade = message.chunk.trade;
            var type = trade.trade_type;
            switch (type) {
              case 'bid':
                this.best_ask = trade.price_int;
                break;
              case 'ask':
                this.best_bid = trade.price_int;
                break;
            }
            if (!this.waiting) {
              if (!this.checkFisherPrice(type)) {
                // cancel order
                this.waiting = true;
                sig = { cancel: [this[type].oid] };
              }
            }
            break;
        }
        break;
      case 2:
        switch (message.type) {
          case 'orderEnd':
            if (this.position.bought === 0 && this.position.sold === 0) {
              this.state = 0;
              this.bid = undefined;
              this.ask = undefined;
            }
            break;
          case 'trade':
            var trade = message.chunk.trade;
            var type = trade.trade_type;
            switch (type) {
              case 'bid':
                this.best_ask = trade.price_int;
                break;
              case 'ask':
                this.best_bid = trade.price_int;
                break;
            }
            if (this[type]) {
              if (this.checkHedgePrice(type)) {
                this[type] = getLiquidatingOrder(type);
                sig[type] = this[type];
              }
            }
            break;
        }
        break;
    }
    console.log('fisher sig', sig);
    if (sig) this.push(sig);
  }
  done();
};

Fisher.prototype.processMessage = function (chunk) {
  var message = {};
  switch (chunk.private) {
    //case 'depth':
      //break;
    //case 'ticker':
      //break;
    case 'trade':
      message.type = 'trade';
      break;
    case 'user_order':
      var user_order = chunk.user_order;
      if (user_order.reason && user_order === 'requested' || user_order === 'completed_passive') {
        message.type = 'orderEnd';
      }
      if (user_order.status && user_order.status === 'pending') {
        this[user_order.type].oid = user_order.oid;
      }
      break;
    case 'wallet':
      switch (chunk.op) {
        case 'in':
          message.type = 'hit';
          this.balance.BTC = chunk.balance.value_int;
          if (this.state === 1) {
            this.position.bought += chunk.amount.value_int;
          } else if (this.state === 2) {
            this.position.sold += chunk.amount.value_int;
          }
          break;
        case 'out':
          message.type = 'hit';
          this.balance.BTC = chunk.balance.value_int;
          if (this.state === 1) {
            this.position.sold -= chunk.amount.value_int;
          } else if (this.state === 2) {
            this.position.bought -= chunk.amount.value_int;
          }
          break;
        case 'spent':
        case 'earned':
          this.balance.USD = chunk.balance.value_int;
          break;
        case 'fee':
          // we only count fees toward the position when they are in BTC
          if (chunk.balance.currency === 'BTC') {
            if (this.state === 1) {
              this.position.bought -= this.amount.value_int;
            } else if (this.state === 2) {
              this.position.sold -= this.amount.value_int;
            }
          }
          this.balance[chunk.balance.currency] = chunk.balance.value_int;
          break;
      }
      break;
  }
  message.chunk = chunk;
  return message;
};

Fisher.prototype.checkFisherPrice = function (type) {
  switch (type) {
    case 'ask':
      return Math.abs((this.best_ask - this.ask.price_int) / this.best_ask) < this._limitPriceTolerance;
      break;
    case 'bid':
      return Math.abs((this.best_bid - this.bid.price_int) / this.best_bid) < this._limitPriceTolerance;
      break;
  }
};

Fisher.prototype.checkHedgePrice = function (type) {
  switch (type) {
    case 'ask':
      return this.ask.price_int > this.best_ask * (1 + this._lossStep);
      break;
    case 'bid':
      return this.bid.price_int < this.best_bid * (1 - this._lossStep);
      break;
  }
};

Fisher.prototype.getFisherPrice = function (type) {
  if (type === 'ask') {
    return Math.ceil(this.best_bid * (1 + this._profitStep));
  }
  if (type === 'bid') {
    return Math.floor(this.best_ask * (1 - this._profitStep));
  }
};

Fisher.prototype.getFisherOrder = function (type) {
  return { type: type, amount_int: this._aimAmount, price_int: this.getFisherPrice(type) };
};

Fisher.prototype.getHedgePrice = function (type) {
  if (type === 'ask') {
    return Math.ceil(this.bid.price_int * (1 + this._profitAim));
  }
  if (type === 'bid') {
    return Math.floor(this.ask.price_int * (1 - this._profitAim));
  }
};

Fisher.prototype.getHedgeAmount = function (type) {
  if (type === 'ask') {
    return Math.abs(this.getPosition());
  }
  if (type === 'bid') {
    return Math.abs(this.getPosition())/(1-this.fee);
  }
};

Fisher.prototype.getHedgeOrder = function (type) {
  return { type: type, amount_int: this.getHedgeAmount(type), price_int: this.getHedgePrice(type) };
};

Fisher.prototype.getLiquidatingPrice = function (type) {
  if (type === 'ask') {
    return Math.ceil(this.best_bid * 98 / 100);
  }
  if (type === 'bid') {
    return Math.floor(this.best_ask * 98 / 100);
  }
};

Fisher.prototype.getLiquidatingOrder = function (type) {
  return { type: type, amount_int: this.getHedgeAmount(type), price_int: this.getLiquidatingPrice(type) };
};

Fisher.prototype.getPosition = function () {
  return this.position.bought - this.position.sold;
};
