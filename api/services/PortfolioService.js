
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
    var self = this;
    //console.log('PortfolioService.getPortfolioDetails(' + portfolioId + ')');

    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
      if (err) {        
        console.log('PortfolioService.getPortfolioDetails: Portfolio.findOne error: ' + err);
        return cb();
      }

      if (portfolio) {
        portfolio.value = portfolio.cash;
        var totalCost = 0;

        // fill live values from ticker table
        Ticker.find({}, function(err, tickers) {

          _.each(portfolio.holdings, function(holding) {

            var ticker = _.find(tickers, {ticker: holding.ticker});
            if (ticker) {
              totalCost += holding.cost;
              portfolio.value += (holding.shares * ticker.price);

              holding.name = ticker.name;
              holding.price = (Math.round(100 * ticker.price) / 100).toFixed(2);
              holding.cost = (Math.round(100 * holding.cost) / 100).toFixed(2);
              holding.value = (Math.round(100 * holding.shares * ticker.price) / 100).toFixed(2);
              holding.change = ticker.change ? (Math.round(100 * ticker.change) / 100).toFixed(2) : 0;
              holding.percentChange = ticker.percentChange ? (ticker.percentChange >= 0 ? '+' : '') + (Math.round(100 * ticker.percentChange) / 100).toFixed(2) + '%' : '+0%';
              holding.returnPercent = (Math.round(10000 * (holding.value - holding.cost) / holding.cost) / 100).toFixed(2);
              holding.returnPercentFormatted = (holding.returnPercent >= 0 ? '+' : '') + holding.returnPercent + '%';
            }
          });

          portfolio.returnPercent = (Math.round(10000 * (portfolio.value - (totalCost + portfolio.cash)) / portfolio.cash) / 100).toFixed(2);
          portfolio.returnPercentFormatted = portfolio.returnPercent >= 0 ? '+' : '' + portfolio.returnPercent + '%';
          portfolio.cash = (Math.round(100 * portfolio.cash) / 100).toFixed(2);
          portfolio.value = (Math.round(100 * portfolio.value) / 100).toFixed(2);

          // console.log('PortfolioService.getPortfolioDetails(' + portfolioId + '): returning');
          return cb(portfolio);             
        });
      }
      else {
        return cb();
      }
    });
  },

  buyOrSell(portfolioId, ticker, buyOrSell, cb) { 
    Portfolio.findOne({id: portfolioId}, function(err, portfolio) {
      if (err) {
        sails.log.warn('Error buying/selling ticker [' + ticker + '] on portfolio [' + portfolioId + ']: ' + err);
        return cb(err);
      }
      else if (!portfolio) {
        sails.log.warn('Error buying/selling ticker [' + ticker + ']: portfolio [' + portfolioId + '] not found');
        return cb(err);
      }

      Transaction.create({type: buyOrSell, portfolioId: portfolioId, ticker: ticker}, function(err, transaction) {
        if (err) {
          sails.log.warn('Error buying/selling ticker [' + ticker + '] on portfolio [' + portfolioId + ']: Error creating transaction: ' + err);
          return cb(err);
        }

        return cb();
      });
    });
  }, 

}
