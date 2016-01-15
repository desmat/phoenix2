// PortfolioService.js

module.exports = {

  fillPortfolioHoldingDetails(portfolioHolding, cb) {
    //console.log('PortfolioService.fillPortfolioHolding: '); console.dir(portfolioHolding);

    TickerService.getTickerDetails(portfolioHolding.ticker, function(ticker) {
      portfolioHolding.name = ticker.name;
      portfolioHolding.cost = portfolioHolding.shares * ticker.price; //TODO NOT CORRECT 
      //more here   

      cb();
    });
  },

  getPortfolioDetails(portfolioId, cb) {
    //console.log('PortfolioService.getPortfolioDetails(' + portfolioId + ')');

    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
      if (err) {        
        console.log('ApiController.portfolioDetails: Portfolio.findOne error: ' + err);
        return cb();
      }

      if (portfolio) {
        // fill live values from ticker table
        Ticker.find({}, function(err, tickers) {
          _.each(portfolio.holdings, function(holding) {
            var ticker = _.find(tickers, {ticker: holding.ticker});
            if (ticker) {
              holding.name = ticker.name;
              holding.price = ticker.price;
              //TODO calculate value and shit
            }
          });

          //console.log('PortfolioService.getPortfolioDetails(' + portfolioId + '): returning');
          return cb(portfolio);             
        });
      }
      else {
        return cb();
      }
    });
  },

}
