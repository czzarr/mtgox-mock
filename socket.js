var MongoClient = require('mongodb').MongoClient;
var io = require('socket.io').listen(3001);

io.on('connection', function (socket) {
  MongoClient.connect("mongodb://localhost:27017/mtgox", function(err, db) {
    var trades = db.collection('trades');
    trades.find().stream().pipe(socket);
  });
  socket.on('message', function (data) {
    switch (data.op) {
      case 'mtgox.subscribe':
        socket.emit('message', { op: 'subscribe', channel: 'b4085284-f4f6-47e8-9e38-723cc11b2796' });
        break;
      case 'unsubscribe':
        socket.emit('message', { op: 'unsubscribe', channel: data.channel });
        break;
    }
  });
});
