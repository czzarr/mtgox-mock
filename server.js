var express = require('express');
var orderbook = require('./orderbook');

var app = express();
app.use(express.bodyParser());
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
