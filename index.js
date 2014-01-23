var goxStream = require('./client')
var fisher = require('./fisher')
var engine = require('./engine')
 //check if these should be strings or ints
 //then fix this fucking mess with bignum
var options = {
  bestBid: 100,
  bestAsk: 101
}

goxStream
  .pipe(fisher(options))
  .pipe(engine())
