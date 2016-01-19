
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

  calculateTransactions(portfolio, cb) {
    console.log('PortfolioService.calculateTransactions');

    portfolio.transactionId = portfolio.hasOwnProperty('transactionId') ? portfolio.transactionId : 0;

    PortfolioTransaction.find({portfolioId: portfolio.id, transactionId: {'>': portfolio.transactionId}}).sort('id ASC').exec(function(err, portfolioTransactions) {
      if (err) {
        sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: ' + err);
        return cb();
      }

      _.each(portfolioTransactions, function(portfolioTransaction) {
        console.log('PortfolioService.calculateTransactions: '); console.dir(portfolioTransaction);

        var holding = _.find(portfolio.holdings, {ticker: portfolioTransaction.ticker});
        if (portfolioTransaction.type == 'buy') {
          if (!holding) {
            holding = {
              ticker: portfolioTransaction.ticker,
              shares: 1, 
              cost: portfolioTransaction.price
            }

            portfolio.holdings.push(holding);
          }
          else {
            holding.shares += 1;
          }

          holding.transactionId = portfolioTransaction.id;

          holding.save(function(err) {
            if (err) {
              sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Error saving holding for ticker: ' + portfolioTransaction.ticker + ': ' + err);
            }

            portfolio.transactionId = portfolioTransaction.id;

            portfolio.save(function(err, portfolio) {
              if (err) {
                sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Error saving portfolio: ' + err);
              }

              //return cb(portfolio);
            });  

          });
        } 
        else if (portfolioTransaction.type == 'sell') {
          if (!holding) {
            sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Portfolio does not contain ticker: ' + portfolioTransaction.ticker);
          }
          else {
            holding.shares -= 1;
            if (holding.shares <= 0) {
              portfolio.holdings = _.difference(portfolio.holdings, _.filter(portfolio.holdings, {ticker: portfolioTransaction.ticker}));
              holding.delete(function(err) {
                if (err) {
                  sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Error deleting holding for ticker: ' + portfolioTransaction.ticker + ': ' + err);
                }
  
                if (portfolioTransaction.id > portfolio.transactionId) portfolio.transactionId = portfolioTransaction.id;
              });
            }

            holding.save(function(err) {
              if (err) {
                sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Error saving holding for ticker: ' + portfolioTransaction.ticker + ': ' + err);
              }

              if (portfolioTransaction.id > portfolio.transactionId) portfolio.transactionId = portfolioTransaction.id;
            });
          }
        }
        else {
          sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Unknown transaction type: ' + portfolioTransaction.type);
        }
      });

      // portfolio.transactionId = transactionId;
      //TODO also deal with cash and shit
      portfolio.save(function(err, portfolio) {
        if (err) {
          sails.log.warn('Error processing PortfolioTransaction\'s for portfolio [' + portfolio.id + ']: Error saving portfolio: ' + err);
        }

        return cb(portfolio);
      });  
    });
  },

  getPortfolioDetails(portfolioId, cb) {
    var self = this;
    console.log('PortfolioService.getPortfolioDetails(' + portfolioId + ')');

    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
      if (err) {        
        console.log('PortfolioService.getPortfolioDetails: Portfolio.findOne error: ' + err);
        return cb();
      }

      if (portfolio) {
        //self.calculateTransactions(portfolio, function(portfolio) {
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
        //});
      }
      else {
        return cb();
      }
    });
  },

  buyOrSell(portfolioId, ticker, buyOrSell, cb) { 
    Portfolio.findOne({id: portfolioId}, function(err, portfolio) {
      if (err) {
        sails.log.warn('Error buying/selling ticker [' + ticker + '] for portfolio [' + portfolioId + ']: ' + err);
        return cb(err);
      }
      else if (!portfolio) {
        sails.log.warn('Error buying/selling ticker [' + ticker + ']: portfolio [' + portfolioId + '] not found');
        return cb(err);
      }

      Transaction.create({type: 'portfolio', data: '{"portfolioId": ' + portfolioId + ', "type": "' + buyOrSell + '", "ticker": "' + ticker + '"}'}, function(err, transaction) {
        if (err) {
          sails.log.warn('Error buying/selling ticker [' + ticker + '] for portfolio [' + portfolioId + ']: Error creating transaction: ' + err);
          return cb(err);
        }

        return cb();
      });
    });
  }, 

}
