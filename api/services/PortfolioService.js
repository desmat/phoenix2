
module.exports = {

  fillPortfolioHoldingDetails(portfolioHolding, cb) {
    //console.log('PortfolioService.fillPortfolioHolding: '); console.dir(portfolioHolding);
    PortfolioHolding.findOne({id: portfolioHolding.id}, function(err, prevPortfolioHolding) {
      if (err) {        
        console.log('PortfolioService.fillPortfolioHoldingDetails: PortfolioHolding.findOne error: ' + err);
        return cb();
      }

      if (!prevPortfolioHolding) {
        prevPortfolioHolding = {};
        prevPortfolioHolding.shares = 0;
        prevPortfolioHolding.cost = 0;
      }

      TickerService.getTickerDetails(portfolioHolding.ticker, function(ticker) {
        portfolioHolding.name = ticker.name;
        portfolioHolding.cost = prevPortfolioHolding.cost + ticker.price * (portfolioHolding.shares - prevPortfolioHolding.shares); //TODO NOT CORRECT 
        //more here ?  

        cb();
      });
    });
  },

  getPortfolioDetails(portfolioId, cb) {
    //console.log('PortfolioService.getPortfolioDetails(' + portfolioId + ')');

    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
      if (err) {        
        console.log('PortfolioService.getPortfolioDetails: Portfolio.findOne error: ' + err);
        return cb();
      }

      if (portfolio) {
        portfolio.value = 0;
        var totalCost = 0;
        // fill live values from ticker table
        Ticker.find({}, function(err, tickers) {
          _.each(portfolio.holdings, function(holding) {
            var ticker = _.find(tickers, {ticker: holding.ticker});
            if (ticker) {
              totalCost = totalCost + holding.cost;
              portfolio.value = portfolio.value + (holding.shares * ticker.price);

              holding.name = ticker.name;
              holding.price = Math.round(100 * ticker.price) / 100;
              holding.cost = Math.round(100 * holding.cost) / 100;
              holding.value = Math.round(100 * holding.shares * ticker.price) / 100;
            }
          });

          portfolio.cash = Math.round(100 * (portfolio.cash - totalCost)) / 100;
          portfolio.value = Math.round(100 * (portfolio.value + portfolio.cash)) / 100;

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
