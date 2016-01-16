var request = require('request');
var moment = require('moment-timezone');

module.exports = {

  isMarketOpen() {
    var today = moment.tz(today, "America/New_York");
    var marketOpen = moment.tz(today, "America/New_York").hours(9).minutes(30).seconds(0);
    var marketClose = moment.tz(today, "America/New_York").hours(16).minutes(0).seconds(0);
    var marketCloseHalf = moment.tz(today, "America/New_York").hours(13).minutes(0).seconds(0);

    return today.day() >= 1 && today.day() <= 5 && 
        today.diff(marketOpen) > 0 && today.diff(marketClose) < 0
        !this.isMarketHoliday() &&
        !(this.isMarketHalfDay() && today.diff(marketCloseHalf) < 0);
  },

  isMarketHoliday() {
    //TODO
    return false;
  }, 

  isMarketHalfDay() {
    //TODO
    return false;
  },

  getTickerDetails(symbol, cb) {
    //console.log('TickerService.getTickerDetails: symbol=' + symbol);
    var self = this;

    Ticker.findOne({ticker: symbol}, function(err, ticker) {
      if (err) {
        console.log('TickerService.getTickerDetails: Ticker.findOne error: ' + err);
        return;
      }

      if (!ticker) {        
        //TODO get name and fresh price from external service

        self.getQuote(symbol, function(err, data) {
          //console.log('TickerService.getTickerDetails: getQuote: '); console.dir(data);
          if (err) {
            console.log('TickerService.getTickerDetails: getQuote error: ' + err);
            return cb({});
          }

          if (!data) {
            console.log('TickerService.getTickerDetails: getQuote error: symbol not found: ' + symbol);
            return cb({});
          }

          Ticker.create({ticker: symbol, name: data.Name, price: data.LastTradePriceOnly}, function(err, ticker) {
            if (err) {
              console.log('TickerService.getTickerDetails: Ticker.create error: ' + err);
              return;
            }

            cb(ticker);
          });
        });
      }
      else {
        cb(ticker);
      }
    });      
  },

  updateAll(cb) {
    var self = this;

    Ticker.find({}, function(err, tickers) {
      var tickersToQuery = _.map(tickers, function(i) { return i.ticker });

      self.getQuotes(tickersToQuery, function(err, datae) {

        if (err) {
          console.log('TickerService.updateAll: getQuotes error: ' + err);
          return cb();
        }

        if (datae) {
          _.each(datae, function(data) {
            //console.log('TickerService.updateAll: getQuotes: data: '); console.dir(data);

            var ticker = _.find(tickers, {ticker: data.Symbol});
            if (ticker) {
              var dirty = false;

              if (ticker.name != data.Name) {
                ticker.name = data.Name;
                dirty = true;
              }

              if (ticker.price !== Math.round(100 * parseFloat(data.LastTradePriceOnly)) / 100) {
                ticker.price = Math.round(100 * parseFloat(data.LastTradePriceOnly)) / 100;
                dirty = true;
              }

              if (dirty) {
                console.log('TickerService.updateAll: Ticker [' + ticker.ticker + '] updated');
                ticker.save();
              }
            }
          });

          return cb();
        }

        return cb();
      });
    });
  },

  getQuote(ticker, cb) {
    var quotes = this.getQuotes([ticker], function(err, quotes) {
      if (err) return cb(err);

      //console.dir(quotes);
      if (quotes && quotes.length > 0) return cb(null, quotes[0]);

      return cb('Empty ticker query result: ' + ticker);
    });
  },

  getQuotes(tickers, cb) {
    var tickersToQuery = '';
    for (var i = 0; i < tickers.length; i++) {
      tickersToQuery += '%22' + tickers[i] + '%22' + '%2C';
    }
    tickersToQuery = tickersToQuery.substring(0, tickersToQuery.length - 3)

    var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(' + tickersToQuery + ')%0A%09%09&format=json&diagnostics=false&env=http%3A%2F%2Fdatatables.org%2Falltables.env';
    request(url, function(err, resp, body) {
      if (err) return cb(err);

      var data = JSON.parse(body);
      //console.log('getQuotes: '); console.dir(data);

      if (data.query.count === 0) {
        cb('Empty ticker query result: ' + tickersToQuery);
      }
      else if (data.query.count === 1) {
        cb(null, [data.query.results.quote]);
      }
      else {
        cb(null, data.query.results.quote);
      }
    });
  }, 

}