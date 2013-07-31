var StreamToMongo = require('stream-to-mongo');
var parser = require('JSONStream').parse('data');
var options = { db: 'mongodb://localhost:27017/mtgox', collection: 'trades' };
var streamToMongo = new StreamToMongo(options);

process.stdin.pipe(parser).pipe(streamToMongo);
