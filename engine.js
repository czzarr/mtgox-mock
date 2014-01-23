var stream = require('stream');
var HttpGoxClient = require('./httpGoxClient');
var httpGoxClient = new HttpGoxClient();

module.exports = createEngineStream;

function cb (err, body) {
  if (err) throw err;
  console.log(body);
}

function createEngineStream (options) {
  return new Engine(options);
}

Engine.prototype = Object.create(stream.Transform.prototype, { constructor: Engine });

function Engine (options) {
  stream.Transform.call(this, { objectMode: true });
}

Engine.prototype._transform = function (chunk, encoding, done) {
  if (chunk.ask) {
    httpGoxClient.add('ask', chunk.ask.amount_int, chunk.ask.price_int, cb);
  }
  if (chunk.bid) {
    httpGoxClient.add('bid', chunk.bid.amount_int, chunk.bid.price_int, cb);
  }
  if (chunk.cancel && chunk.cancel.length > 0) {
    chunk.cancel.forEach(function (oid) {
      httpGoxClient.cancel(oid, cb);
    });
  }
  done();
};
