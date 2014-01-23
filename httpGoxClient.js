var request = require('request')
  , querystring = require('querystring')
  , endpoint = 'http://localhost:3000/money/'
  ;

module.exports = HttpGoxClient;

function HttpGoxClient (options) {
  this.options = options || {};
}

HttpGoxClient.prototype._executeRequest = function (options, cb) {
  if ('function' === typeof cb) {
    request(options, function(err, res, body) {
      if (err) {
        cb(err);
      } else {
        cb(null, JSON.parse(body));
      }
    });
  } else {
    return request(options);
  }
};

HttpGoxClient.prototype._makePrivateRequest = function (path, args, cb) {
  // deal with optional args argument
  if ('function' === typeof args) {
    cb = args;
    args = {};
  }
  args ? args : args = {};

  var data = querystring.stringify(args)
  var url = endpoint + path;
  var options = { url: url, method: 'POST', body: data };

  return this._executeRequest(options, cb);
};

HttpGoxClient.prototype.add = function (type, amount_int, price_int, cb) {
  // PREVENT MARKET ORDERS
  if (!typeof price_int === 'number') {
    console.log('trying to place a market order, exiting');
    return;
  }
  var path = 'order/add';
  var args = { type: type, amount_int: amount_int, price_int: price_int };
  return this._makePrivateRequest(path, args, cb);
};

HttpGoxClient.prototype.cancel = function (orderId, cb) {
  var path = 'order/cancel';
  var args = { oid: orderId };
  return this._makePrivateRequest(path, args, cb);
};
