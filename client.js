var Stream = require('stream');
var io = require('socket.io-client');
var config = require('./config');
var goxStream = Stream.Readable({ objectMode: true });
var conn = null;

goxStream._read = function () {
  if (conn) return;
  var self = this;
  conn = io.connect('http://localhost:3000');
  conn.on('connect', function () {
    console.log('We are connected to MockGox');
  });
  conn.emit('message', { op: 'unsubscribe', channel: config.MTGOX_WEBSOCKET_CHANNELS.depth });
  conn.emit('message', { op: 'unsubscribe', channel: config.MTGOX_WEBSOCKET_CHANNELS.ticker });
  conn.emit('message', { op: 'mtgox.subscribe', key: 'tAhShPT2R+ieOHI8wRsnlgAAAABR8YGVCrrJpmzl3HbktpkUriH/aeDYJ6p08mWIQp6zgQyni64' });
  conn.on('message', function (data) {
    console.log(data);
    self.push(data);
  });
};

module.exports = goxStream;
