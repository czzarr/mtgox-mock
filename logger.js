var bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'fisher',
  streams: [
    {
      path: './fisher.log',
      level: 'info'
    },
    {
      stream: process.stdout,
      level: 'debug'
    }]
});
