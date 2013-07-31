var io = require('socket.io-client');

var conn = io.connect('http://localhost:3001');
conn.on('connect', function () {
  console.log('We are connected to MockGox');
});
conn.on('message', function (data) {
  console.log(data);
});
