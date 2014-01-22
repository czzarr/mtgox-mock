var currency = require('mtgox-currency');

module.exports.usdAmount = function usdAmount (value_int) {
  return {
    value: currency.usdInt2FloatString(value_int),
    value_int: value_int,
    display: currency.usdInt2Display(value_int),
    display_short: currency.usdInt2DisplayShort(value_int)
  };
};

module.exports.btcAmount = function btcAmount (value_int) {
  return {
    value: currency.btcInt2FloatString(value_int),
    value_int: value_int,
    display: currency.btcInt2Display(value_int),
    display_short: currency.btcInt2DisplayShort(value_int)
  };
};
