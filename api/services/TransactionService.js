

module.exports = {

  processPortfolioTransaction(transactionId, portfolioId, tickerSymbol, count, cb) {
    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {

      if (err) {        
        return cb('Error querying portfolio [' + portfolioId + ']: ' + err);
      }
      else if (!portfolio) {
        return cb('Portfolio [' + portfolioId + '] not found');
      }

      TickerService.getTickerDetails(tickerSymbol, function(err, ticker) {

        if (err) {        
          return cb('Error querying ticker [' + tickerSymbol + ']: ' + err, portfolio);
        }
        else if (!ticker) {
          //TODO go find the new ticker!
          return cb('Ticker not found', portfolio);
        }

        //don't allow cash to go negative
        if (ticker.price * count > portfolio.cash) {
          return cb('Insufficient funds', portfolio);
        }

        var holding = _.find(portfolio.holdings, {ticker: tickerSymbol});
        if (!holding) {
          holding = {
            id: 0,
            portfolioId: portfolioId,
            ticker: tickerSymbol,
            shares: 0, 
            cost: 0
          }

          portfolio.holdings.push(holding);
        }

        //don't see things we don't have!
        if (count < 0 && Math.abs(count) > holding.shares) {
          return cb('Insuffient shares');
        }

        holding.shares += count;
        holding.cost += ticker.price * count;
        holding.transactionId = transactionId;

        portfolio.cash -= holding.cost;
        portfolio.cost += holding.cost;
        portfolio.transactionId = transactionId;

        var f = function(err) {
          if (err) {
            return cb('Error creating/saving/deleting portfolio holding: ' + err, portfolio);
          }

          return cb(null, portfolio);            
        };

        if (holding.shares <= 0) {
          holding.destroy(f);
        }
        else if (holding.id == 0) {
          PortfolioHolding.create(holding, f);
        }
        else {
          holding.save(f);
        }
      });        
    }); 
  },

  process(cb) {
    var self = this;
    if (!cb) cb = function() {};

    Transaction.find({state: 'new'}).sort('id ASC').exec(function(err, transactions) {
      if (err) {
        sails.log.warn('TransactionService.process: Error processing transactions: ' + err);
        return cb();
      }

      var byPortfolio = _.groupBy(transactions, function(n) { return n.portfolioId });

      _.each(Object.keys(byPortfolio), function(transactionPortfolioId) {

        var byPortfolioByTicker = _.groupBy(byPortfolio[transactionPortfolioId], function(n) { return n.ticker });
        var keys = Object.keys(byPortfolioByTicker);
        var lastKey = keys.length - 1;

        _.each(keys, function(transactionTicker, key) {

          var transactionId = _.max(byPortfolioByTicker[transactionTicker], function(n) { return n.id }).id;
          var byPortfolioByTickerByType = _.groupBy(byPortfolioByTicker[transactionTicker], function(n) { return n.type });
          var qty = ((byPortfolioByTickerByType['buy'] || []).length - (byPortfolioByTickerByType['sell'] || []).length);
          
          self.processPortfolioTransaction(transactionId, transactionPortfolioId, transactionTicker, qty, function(err, portfolio) {

            if (err) {
              sails.log.warn('TransactionService.process: Error processing transactions for ticker [' + transactionTicker + '] on portfolio [' + transactionPortfolioId + ']: ' + err);
            }

            //TODO this fails when adding a new holding
            
            if (portfolio && key == lastKey) {
              //only save and publish when processed all holdings for portfolio
              portfolio.save(function(err, portfolio) {
                if (err) {        
                  return cb('Error saving portfolio [' + portfolioId + ']: ' + err);
                }

                Portfolio.publishUpdate(portfolio.id);
              });
            }
          });
        });
      });

      _.each(transactions, function(n) { 
        n.state = 'processed';
        n.save(function(err) {
          if (err) {
            sails.log.warn('Error saving transaction [' + n.id + ']: ' + err);
          }
        });
      });

      return cb();
    });
  }, 

}
