var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express()
app.use(express.bodyParser())
app.use(app.router)
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
server.listen(3000)
var is = require('interval-stream');
var through = require('through');
var config = require('./config');
var messages = require('./messages');
var orderbook = require('./orderbook')();
var socketStream = require('./socket-stream');


io.on('connection', function (socket) {
  var emitter = socketStream(socket);
  MongoClient.connect("mongodb://localhost:27017/mtgox", function(err, db) {
    var trades = db.collection('trades').find().skip(3925).stream();
    trades
      .pipe(through(function (chunk) {
        chunk.price_int = parseInt(chunk.price_int, 10)
        chunk.amount_int = parseInt(chunk.amount_int, 10)
        this.queue({ trade: chunk, type: 'trade' });
      }))
      .pipe(is(500, { objectMode: true }))
      .pipe(orderbook)
      .pipe(emitter);
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


app.get('/test', function (req, res) {
  res.send(200, 'test worked');
});

app.post('/money/order/add', function (req, res) {
  var order = {
    amount_int: parseInt(req.body.amount_int, 10),
    price_int: parseInt(req.body.price_int, 10),
    type: req.body.type,
    oid: Math.floor(Math.random()*10000),
    date: Date.now()
  };
  orderbook.add(order);
  res.json(200, { message: 'order added' });
});

app.post('/money/order/cancel', function (req, res) {
  orderbook.cancel(req.body.oid);
  res.json(200, { message: 'order cancelled' });
});
