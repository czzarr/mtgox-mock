var io = require('socket.io-client');
var config = require('./config');

var conn = io.connect('http://localhost:3000');
conn.on('connect', function () {
  console.log('We are connected to MockGox');
});
conn.emit('message', { op: 'unsubscribe', channel: config.MTGOX_WEBSOCKET_CHANNELS.depth });
conn.emit('message', { op: 'unsubscribe', channel: config.MTGOX_WEBSOCKET_CHANNELS.ticker });
conn.emit('message', { op: 'mtgox.subscribe', key: 'tAhShPT2R+ieOHI8wRsnlgAAAABR8YGVCrrJpmzl3HbktpkUriH/aeDYJ6p08mWIQp6zgQyni64' });
conn.on('message', function (data) {
  console.log(data);
});
