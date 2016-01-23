var request = require('request');
var moment = require('moment-timezone');
var _ = require('lodash'); //for some reason can't find the chunk function... I thought Sails used lodash...

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
        return cb('Ticker.findOne error: ' + err);
      }

      if (!ticker) {        
        self.getQuote(symbol, function(err, data) {
          //console.log('TickerService.getTickerDetails: getQuote: '); console.dir(data);
          if (err) {
            return cb('getQuote error: ' + err);
          }

          if (!data || !data.Name) {
            return cb('getQuote error: symbol not found: ' + symbol);
          }

          var ticker = {
            ticker: symbol, 
            name: data.Name, 
            price: parseFloat(data.LastTradePriceOnly),
          };

          ticker.change = data.Change ? parseFloat(data.Change) : 0.00,
          ticker.percentChange = data.PercentChange ? parseFloat(data.PercentChange.replace('%')) : 0.00,

          Ticker.create(ticker, function(err, ticker) {
            if (err) {
              return cb('Ticker.create error: ' + err);
            }

            //alert anyone watching tickers that this guy's created
            Ticker.publishUpdate(ticker.id);

            cb(null, ticker);
          });
        });
      }
      else {
        cb(null, ticker);
      }
    });      
  },

  updateAll(cb) {
    var self = this;

    Ticker.find({}, function(err, tickers) {
      var tickersToQuery = _.map(tickers, function(i) { return i.ticker });
      var chunkSize = 5;
      var chunkCounter = 0;
      var tickerCounter = 0;

      var done = function(chunkCounter, tickerCounter) {
        //console.log('done(' + chunkCounter + ', ' + tickerCounter + ')');
        if (typeof chunkCounter === 'undefined') {
          return cb();
        }
        else if (typeof tickerCounter === 'undefined' && chunkSize * chunkCounter >= tickersToQuery.length) {
          return cb();
        }
        else if (tickerCounter >= tickersToQuery.length) {
          return cb();
        }                    
      };

      //process by chunks

      _.each(_.chunk(tickersToQuery, chunkSize), function(chunk, i) {
        chunkCounter++;

        self.getQuotes(chunk, function(err, datae) {

          if (err) {
            sails.log.warn('TickerService.updateAll: getQuotes error: ' + err);
            
            return done(i);
          }

          if (datae) {
            _.each(datae, function(data, ii) {
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
                  ticker.change = data.Change ? parseFloat(data.Change) : 0.00,
                  ticker.percentChange = data.PercentChange ? parseFloat(data.PercentChange.replace('%')) : 0.00,

                  dirty = true;
                }

                if (dirty) {
                  //sails.log.debug('TickerService.updateAll: Ticker [' + ticker.ticker + '] updating...');
                  ticker.save(function(err) {
                    tickerCounter++;

                    if (err) {
                      sails.log.warn('TickerService.updateAll: ticker.save error: ' + err);
                    }
                    else {
                      sails.log.debug('TickerService.updateAll: Ticker [' + ticker.ticker + '] updated');
                    }

                    //alert anyone watching tickers that this guy's updated
                    Ticker.publishUpdate(ticker.id);

                    return done(chunkCounter, tickerCounter);
                  });
                }
                else {
                  return done(chunkCounter, tickerCounter);
                }
              }
              else {
                return done(chunkCounter, tickerCounter);
              }              
            });

            // return cb();
          }
          else {
            return done(chunkCounter);
          }
        });
      });
    });
  },

  getQuote(ticker, cb) {
    //console.log('TickerService.getQuote(' + ticker + ')');

    var quotes = this.getQuotes([ticker], function(err, quotes) {
      if (err) return cb(err);

      //console.dir(quotes);
      if (quotes && quotes.length > 0) return cb(null, quotes[0]);

      return cb('Empty ticker query result: ' + ticker);
    });
  },

  getQuotes(tickers, cb) {
    //console.log('TickerService.getQuotes(): '); console.dir(tickers);

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