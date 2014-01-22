var MongoClient = require('mongodb').MongoClient;
var io = require('socket.io').listen(3001);
var IntervalStream = require('interval-stream');
var through = require('through');
var config = require('./config');
var messages = require('./messages');
var Orderbook = require('./orderbook');
var socketStream = require('./socket-stream');
var is = new IntervalStream(1000, true);
var orderbook = new Orderbook();

io.on('connection', function (socket) {
  var emitter = socketStream(socket);
  MongoClient.connect("mongodb://localhost:27017/mtgox", function(err, db) {
    var trades = db.collection('trades').find().stream();
    trades
      .pipe(through(function (chunk) {
        this.queue({ trade: chunk, type: 'trade' });
      }))
      .pipe(is).pipe(orderbook).pipe(emitter);
  });
  socket.on('message', function (data) {
    switch (data.op) {
      case 'mtgox.subscribe':
        socket.emit('message', messages.subscribe(config.MTGOX_PRIVATE_CHANNEL));
        break;
      case 'unsubscribe':
        socket.emit('message', messages.unsubscribe(data.channel));
        break;
    }
  });
});
