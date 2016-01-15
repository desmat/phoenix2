var request = require('request');

module.exports = {

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
      _.each(tickers, function(ticker) {
        self.getQuote(ticker.ticker, function(err, data) {
          if (err) {
            console.log('TickerService.updateAll: getQuote error: ' + err);
          }

          if (data) {
            //console.log('TickerService.updateAll: Ticker [' + ticker.ticker + ']: getQuote: '); console.dir(data);
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
      });

      cb();
    });
  },

  getQuote(ticker, cb) {

    var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + ticker + '%22)%0A%09%09&format=json&diagnostics=false&env=http%3A%2F%2Fdatatables.org%2Falltables.env';
    request(url, function(err, resp, body) {
      if (err) return cb(err);

      var data = JSON.parse(body);

      if (!data || !data.query || !data.query.result) return cb("Empty ticker query: " + ticker); 
      var name =  data.query.results.quote.Name;

      if (!data.query.results.quote.Name) return cb("Ticker not found: " + ticker);

      cb(null, data.query.results.quote);
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
      if (data.query.count === 1) {
        cb(null, [data.query.results.quote]);
      }
      else {
        cb(null, data.query.results.quote);
      }
    });
  }, 

}