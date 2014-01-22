var currency = require('mtgox-currency');

module.exports.usdAmount = function usdAmount (value_int_string) {
  var value_int = parseInt(value_int_string, 10)
  return {
    value: currency.usdInt2FloatString(value_int).toString(),
    value_int: value_int_string,
    display: currency.usdInt2Display(value_int).toString(),
    display_short: currency.usdInt2DisplayShort(value_int).toString()
  };
};

module.exports.btcAmount = function btcAmount (value_int_string) {
  var value_int = parseInt(value_int_string, 10)
  return {
    value: currency.btcInt2FloatString(value_int).toString(),
    value_int: value_int_string,
    display: currency.btcInt2Display(value_int).toString(),
    display_short: currency.btcInt2DisplayShort(value_int).toString()
  };
};
