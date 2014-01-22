var MongoClient = require('mongodb').MongoClient;
var io = require('socket.io').listen(3001);
var IntervalStream = require('interval-stream');
var through = require('through');
var express = require('express');
var replify = require('replify')
var config = require('./config');
var messages = require('./messages');
var orderbook = require('./orderbook')();
var socketStream = require('./socket-stream');
var is = new IntervalStream(1000, true);

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

var app = express();
app.use(express.json());
app.use(app.router);
var server = app.listen(3000);

app.get('/test', function (req, res) {
  res.send(200, 'test worked');
});

app.post('/money/order/add', function (req, res) {
  var order = { amount_int: req.body.amount_int, price_int: req.body.price_int, type: req.body.type };
  orderbook.add(order);
  res.send(200, 'order added');
});

app.post('/money/order/cancel', function (req, res) {
  orderbook.cancel(req.body.oid);
  res.send(200, 'order cancelled');
});
replify('socket', orderbook)
