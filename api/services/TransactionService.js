

module.exports = {

  processPortfolioTransaction(transactionId, portfolioId, tickerSymbol, count, cb) {
    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {

      if (err) {        
        return cb('Error querying portfolio [' + portfolioId + ']: ' + err);
      }
      else if (!portfolio) {
        return cb('Portfolio [' + portfolioId + '] not found');
      }

      Ticker.findOne({ticker: tickerSymbol}, function(err, ticker) {
        if (err) {        
          return cb('Error querying ticker [' + tickerSymbol + ']: ' + err);
        }
        else if (!ticker) {
          //TODO go find the new ticker!
          return cb('Ticker [' + tickerSymbol + '] not found');
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

        //TODO make sure we don't go negative holdings or buy more than cash!

        holding.shares += count;
        holding.cost += ticker.price * count;
        holding.transactionId = transactionId;

        var f = function(err) {
          if (err) {
            return cb('Error saving/deleting holding for ticker: ' + tickerSymbol + ': ' + err);
          }

          portfolio.transactionId = transactionId;
          //TODO update cash and other things here

          portfolio.save(function(err, portfolio) {
            if (err) {
              return cb('Error saving portfolio: ' + err);
            }

            return cb(null, portfolio);
          });            
        }

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

      //if (transactions.length > 0) console.log('TransactionService.process: processing ' + transactions.length + ' transaction(s)');

      var byPortfolio = _.groupBy(transactions, function(n) { return n.portfolioId });

      _.each(Object.keys(byPortfolio), function(transactionPortfolioId) {

        var byPortfolioByTicker = _.groupBy(byPortfolio[transactionPortfolioId], function(n) { return n.ticker });

        _.each(Object.keys(byPortfolioByTicker), function(transactionTicker) {

          var byPortfolioByTickerByType = _.groupBy(byPortfolioByTicker[transactionTicker], function(n) { return n.type });

          //TODO figure out max transaction id

          self.processPortfolioTransaction(1234/*TODO*/, transactionPortfolioId, transactionTicker, ((byPortfolioByTickerByType['buy'] || []).length - (byPortfolioByTickerByType['sell'] || []).length), function(err, portfolio) {
            //notify portfolio to update front-end
            //TODO this fails when adding a new holding
            Portfolio.publishUpdate(portfolio.id);
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
