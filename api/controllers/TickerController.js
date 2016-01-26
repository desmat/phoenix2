/**
 * TickerController
 *
 * @description :: Server-side logic for managing Tickers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
  updateAll(req, res) {
    res.send("Updating all tickers...");
    TickerService.updateAll(function() {
      // res.write("Done!");
      // res.end();
    });
  },

  //WARNING: implementing find(..) will kill socketio and waste you a perfectly good morning!
  details(req, res) {
    // console.log('TickerController.find(...)');

    Ticker.find({}, function(err, tickers) {
      if (err) {
        var msg = 'Ticker.find error: ' + err;
        sails.log.warn('TickerController.find: ' + msg);
        return res.json({error: msg});
      }

      _.each(tickers, function(ticker) {
        ticker.price = ticker.price ? parseFloat(ticker.price).toFixed(2) : '0.00';
        ticker.percentChange = ticker.percentChange || 0;
        ticker.percentChangeFormatted = (ticker.percentChange > 0 ? '+' : '') + ticker.percentChange.toFixed(2) + '%';
      })

      return res.json(tickers);
    });
  }, 

  create(req, res) {
    // console.log('TickerController.create(...)');
    // console.dir(req.body);
    var ticker = req.body;

    if (!ticker) {
        var msg = 'Unable to create new ticker: [ticker] is required';
        sails.log.warn('TickerController.create: ' + msg);
        return res.json({error: msg});
    }

    ticker.ticker = ticker.ticker.toUpperCase();

    //this will create the ticker if does not exist
    TickerService.getTickerDetails(ticker, function(err, tickerDetails) {
      if (err) {
        var msg = 'TickerService.getTickerDetails error: ' + err;
        sails.log.warn('TickerController.create: ' + msg);
        //return res.json({error: msg});
        tickerDetails = {ticker: ticker.ticker}; //still save the ticker and let the rest get filled out later
      }

      Ticker.create(tickerDetails, function(err, newTicker) {
        if (err) {
          var msg = 'Ticker.create error: ' + err;
          sails.log.warn('TickerController.create: ' + msg);
          return res.json({error: msg});
        }

        Ticker.publishCreate(newTicker);

        return res.json(newTicker);
      });
    });
  }
};

