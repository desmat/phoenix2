

module.exports = {

  processPortfolioTransaction(transactionId, portfolioId, tickerSymbol, count, cost, cb) {
    Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {

      if (err) {        
        return cb('Error querying portfolio [' + portfolioId + ']: ' + err);
      }
      else if (!portfolio) {
        return cb('Portfolio [' + portfolioId + '] not found');
      }

      // TickerService.getTickerDetails(tickerSymbol, function(err, ticker) {
      //   if (typeof cost === 'undefined' || _.isNaN(cost)) {
      //     console.log('asdf');
      //     cost = ticker.price * count;
      //   }

      //   if (err) {        
      //     return cb('Error querying ticker [' + tickerSymbol + ']: ' + err, portfolio);
      //   }
      //   else if (!ticker) {
      //     //TODO go find the new ticker!
      //     return cb('Ticker not found', portfolio);
      //   }

        //don't allow cash to go negative
        if (cost > portfolio.cash) {
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

        //don't sell things we don't have!
        if (count < 0 && Math.abs(count) > holding.shares) {
          return cb('Insuffient shares');
        }

        holding.transactionId = transactionId;
        holding.shares += count;
        holding.cost += cost;

        portfolio.cash -= cost;
        portfolio.cost += cost;
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
      // });        
    }); 
  },

  processAll(cb) {
    var self = this;
    if (!cb) cb = function() {};

    Transaction.find({state: 'new'}).sort('id ASC').exec(function(err, transactions) {
      if (err) {
        sails.log.warn('TransactionService.processAll: Error processing transactions: ' + err);
        return cb();
      }

      var byPortfolio = _.groupBy(transactions, function(n) { return n.portfolioId });

      _.each(Object.keys(byPortfolio), function(transactionPortfolioId) {

        var byPortfolioByTicker = _.groupBy(byPortfolio[transactionPortfolioId], function(n) { return n.ticker });
        var keys = Object.keys(byPortfolioByTicker);
        var lastKey = keys.length - 1;

        _.each(keys, function(tickerSymbol, key) {

          var transactionId = _.max(byPortfolioByTicker[tickerSymbol], function(n) { return n.id }).id;
          var byPortfolioByTickerByType = _.groupBy(byPortfolioByTicker[tickerSymbol], function(n) { return n.type });
//           var qty = ((byPortfolioByTickerByType['buy'] || []).length - (byPortfolioByTickerByType['sell'] || []).length);
//console.dir(byPortfolioByTickerByType);       



//console.log(_.map(byPortfolioByTickerByType['buy'], function(n) { return n.quantity * n.price; }));

            TickerService.getTickerDetails(tickerSymbol, function(err, ticker) {
              if (err) {        
                return cb('Error querying ticker [' + tickerSymbol + ']: ' + err);
              }
              else if (!ticker) {
                //TODO go find the new ticker!
                return cb('Ticker not found');
              }


//_.each(byPortfolioByTickerByType, function(transactions, type) { 


var quantity = 
  _.reduce(byPortfolioByTickerByType['buy'], function(total, n) { return total + n.quantity; }, 0) - 
  _.reduce(byPortfolioByTickerByType['sell'], function(total, n) { return total + n.quantity; }, 0);

var total = 
  _.reduce(byPortfolioByTickerByType['buy'],  function(total, n) { return total + (n.quantity * (typeof n.price !== 'undefined' ? n.price : ticker.price)); }, 0) -   
  _.reduce(byPortfolioByTickerByType['sell'], function(total, n) { return total + (n.quantity * (typeof n.price !== 'undefined' ? n.price : ticker.price)); }, 0);

console.log('quantity=' + quantity + ' total=' + total);

if (typeof total === 'undefined' || _.isNaN(total)) {
  //console.log('asdf');
  total = ticker.price * quantity;
}


            self.processPortfolioTransaction(transactionId, transactionPortfolioId, tickerSymbol, quantity, total, function(err, portfolio) {

              if (err) {
                sails.log.warn('TransactionService.processAll: Error processing transactions for ticker [' + tickerSymbol + '] on portfolio [' + transactionPortfolioId + ']: ' + err);
              }

              //TODO this fails when adding a new holding
              

              //TODO figure out how to deal with buys and sells separated
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
      });

      _.each(transactions, function(n) { 
        n.state = 'processed';
        n.save(function(err, transaction) {
          if (err) {
            sails.log.warn('Error saving transaction [' + n.id + ']: ' + err);
          }

          sails.log.debug('TransactionService.processAll: processed transaction [' + transaction.id + ']');
        });
      });

      return cb();
    });
  }, 

}
