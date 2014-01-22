var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express()
var server = require('http').Server(app)
var io = require('socket.io').listen(server)
server.listen(3000)
var is = require('interval-stream');
var through = require('through');
var replify = require('replify')
var config = require('./config');
var messages = require('./messages');
var orderbook = require('./orderbook')();
var socketStream = require('./socket-stream');

app.use(express.json())
app.use(app.router)

io.on('connection', function (socket) {
  var emitter = socketStream(socket);
  MongoClient.connect("mongodb://localhost:27017/mtgox", function(err, db) {
    var trades = db.collection('trades').find().stream();
    trades
      .pipe(through(function (chunk) {
        this.queue({ trade: chunk, type: 'trade' });
      }))
      .pipe(is(1000, { objectMode: true })).pipe(orderbook).pipe(emitter);
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
    amount_int: req.body.amount_int,
    price_int: req.body.price_int,
    type: req.body.type,
    oid: Math.floor(Math.random()*10000),
    date: Date.now()
  };
  orderbook.add(order);
  res.send(200, 'order added');
});

app.post('/money/order/cancel', function (req, res) {
  orderbook.cancel(req.body.oid);
  res.send(200, 'order cancelled');
});
