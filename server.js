var express = require('express');

var app = express();
app.use(express.bodyParser());
app.use(app.router);
var server = app.listen(3000);

app.get('/test', function (req, res) {
  res.send(200);
});

app.post('/money/order/add', function (req, res) {
  // add to queue
  res.send(200);
});

app.post('/money/order/cancel', function (req, res) {
  // add to queue
  res.send(200);
});
