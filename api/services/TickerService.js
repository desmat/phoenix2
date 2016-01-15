// TickerService.js

module.exports = {

  getTickerDetails(symbol, cb) {
    Ticker.findOne({ticker: symbol}, function(err, ticker) {
      if (err) {
        console.log('TickerService.getTickerDetails: Ticker.findOne error: ' + err);
        return;
      }

      if (!ticker) {        
        //TODO get name and fresh price

        Ticker.create({ticker: symbol, name: 'TODO NAME', price: 1234}, function(err, ticker) {
          if (err) {
            console.log('TickerService.getTickerDetails: Ticker.create error: ' + err);
            return;
          }

          cb(ticker);
        });
      }
      else {
        cb(ticker);
      }
    });      
  },

}