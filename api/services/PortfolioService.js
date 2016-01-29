
module.exports = {

  processPortfolio(portfolio, tickers, cb) {
    var self = this;
    // console.log('PortfolioService.processPortfolio(' + portfolio.id + ', ...)');

    self.getPortfolioDetails(portfolio.id, function(portfolio, err) {
      if (err) {       
        var msg = 'PortfolioService.processPortfolioDetails(' + portfolio.id + ', ...): getPortfolioDetails error: ' + err; 
        sails.log.warn(msg);
        return cb(msg);
      }

      _.each(portfolio.holdings, function(holding) {
        holding.save(function(err) {
          if (err) {
            var msg = 'PortfolioService.processPortfolio(' + portfolio.id + ', ...): holding.save(' + holding.id + ') error: ' + err; 
            sails.log.warn(msg);
          }
        });
      });

      portfolio.save(function(err) {
        if (err) {
          var msg = 'PortfolioService.processPortfolio(' + portfolio.id + ', ...): portfolio.save error: ' + err; 
          sails.log.warn(msg);
          return cb(msg);
        }

        Portfolio.publishUpdate(portfolio.id);

        return cb(null, portfolio);
      });
    });
  },

  processPortfolios(cb) {
    var self = this;
    if (!cb) cb = function() {};
    // console.log('PortfolioService.processPortfolios()');

    Portfolio.find({}).populate('holdings').exec(function(err, portfolios) {
      if (err) {       
        var msg = 'PortfolioService.processPortfolios: Portfolio.find error: ' + err; 
        sails.log.warn(msg);
        return cb(msg);
      }

      var allTheHoldings = _.flatten(_.map(portfolios, function(n) { return n.holdings }));
      var allTheTickers = _.uniq(_.map(allTheHoldings, function(n) { return n.ticker; }));

      Ticker.find({ticker: allTheTickers}, function(err, tickers) {
        if (err) {
          var msg = 'PortfolioService.processPortfolios: Ticker.find error: ' + err; 
          sails.log.warn(msg);
          return cb(msg);
        }
        
        if (!tickers || !tickers.length) {
          return cb();
        }

        _.each(portfolios, function(portfolio, i) {

          self.processPortfolio(portfolio, tickers, function(err, portfolio) {
            if (err) {       
              var msg = 'PortfolioService.processPortfolios: processPortfolio error: ' + err; 
              sails.log.warn(msg);
            }

            if (i == portfolios.length - 1) {
              cb();
            }
          });
        });
      });
    });
  },

  getPortfolioHoldingDetails(holding, ticker, cb) {
    var self = this;
    // console.log('PortfolioService.getPortfolioHoldingDetails(' + holding.id + ')');

    holding.name = ticker.name;
    holding.price = (Math.round(100 * ticker.price) / 100).toFixed(2);
    holding.cost = (Math.round(100 * holding.cost) / 100).toFixed(2);
    holding.value = (Math.round(100 * holding.shares * ticker.price) / 100).toFixed(2);
    holding.change = ticker.change ? (Math.round(100 * ticker.change) / 100).toFixed(2) : 0;
    holding.percentChange = ticker.percentChange ? (Math.round(100 * ticker.percentChange) / 100).toFixed(2) : 0;
    holding.percentChangeFormatted = (holding.percentChange >= 0 ? '+' : '') + holding.percentChange + '%'; 
    holding.returnPercent = (Math.round(10000 * (holding.value - holding.cost) / holding.cost) / 100).toFixed(2);
    holding.returnPercentFormatted = (holding.returnPercent >= 0 ? '+' : '') + holding.returnPercent + '%';

    return cb(null, holding);
  },

  getPortfolioDetails(portfolioId, cb) {
    var self = this;
    // console.log('PortfolioService.getPortfolioDetails(' + portfolioId + ')');

    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
      if (err) {        
        console.log('PortfolioService.getPortfolioDetails: Portfolio.findOne error: ' + err);
        return cb();
      }

      if (portfolio) {
        portfolio.value = portfolio.cash;
        portfolio.cost = 0;

        var done = function(portfolio, i) {
          if (typeof i === 'undefined' || i == portfolio.holdings.length - 1) {
            portfolio.returnPercent = (Math.round(10000 * (portfolio.value - (portfolio.cost + portfolio.cash)) / portfolio.cash) / 100).toFixed(2);
            portfolio.returnPercentFormatted = (portfolio.returnPercent >= 0 ? '+' : '') + portfolio.returnPercent + '%';
            portfolio.cash = (Math.round(100 * portfolio.cash) / 100).toFixed(2);
            portfolio.value = (Math.round(100 * portfolio.value) / 100).toFixed(2);
            return cb(portfolio);
          }
        };

        Ticker.find({ticker: _.map(portfolio.holdings, function(n) { return n.ticker; })}, function(err, tickers) {

          if (err) {
            var msg = 'PortfolioService.getPortfolioDetails: Ticker.find error: ' + err; 
            sails.log.warn(msg);
            return done(portfolio);
          }
          
          if (!tickers || !tickers.length) {
            return done(portfolio);
          }

          _.each(portfolio.holdings, function(holding, i) {

            var ticker = _.find(tickers, {ticker: holding.ticker});
            
            if (!ticker) {
              var msg = 'PortfolioService.getPortfolioDetails: ticker not found: ' + holding.ticker; 
              sails.log.warn(msg);
              return done(portfolio, i);
            }

            self.getPortfolioHoldingDetails(holding, ticker, function(err, holding) {
              if (err) {
                var msg = 'PortfolioService.getPortfolioDetails: getPortfolioHoldingDetails error: ' + err; 
                sails.log.warn(msg);
                return done(portfolio, i);
              }

              portfolio.cost += parseFloat(holding.cost);
              portfolio.value += (holding.shares * ticker.price);

              return done(portfolio, i);
            });
          });
        });
      }
      else {
        return cb();
      }
    });
  },

  buyOrSell(portfolioId, ticker, buyOrSell, quantity, cb) { 
    Portfolio.findOne({id: portfolioId}, function(err, portfolio) {
      if (err) {
        sails.log.warn('Error buying/selling ticker [' + ticker + '] on portfolio [' + portfolioId + ']: ' + err);
        return cb(err);
      }
      else if (!portfolio) {
        sails.log.warn('Error buying/selling ticker [' + ticker + ']: portfolio [' + portfolioId + '] not found');
        return cb(err);
      }

      Transaction.create({type: buyOrSell, portfolioId: portfolioId, ticker: ticker, quantity: quantity}, function(err, transaction) {
        if (err) {
          sails.log.warn('Error buying/selling ticker [' + ticker + '] on portfolio [' + portfolioId + ']: Error creating transaction: ' + err);
          return cb(err);
        }

        return cb();
      });
    });
  }, 

}
