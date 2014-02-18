var goxStream = require('./client')
var fisher = require('./fisher')
var engine = require('./engine')
var usdMultiple = require('./config').usdMultiple

var options = {
  bestBid: 100 * usdMultiple,
  bestAsk: 101 * usdMultiple
}

goxStream
  .pipe(fisher(options))
  .pipe(engine())
