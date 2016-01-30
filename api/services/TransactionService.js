

module.exports = {

  findPortfolioHolding(portfolio, ticker, cb) {

    var holding = _.find(portfolio.holdings, {ticker: ticker});
    if (holding) {
      return cb(null, holding);
    }

    var holding = {
      id: 0,
      portfolioId: portfolio.id,
      ticker: ticker,
      shares: 0, 
      cost: 0
    };

    portfolio.holdings.push(holding);

    return cb(null, holding);
  },

  processPortfolioTransaction(portfolio, transaction, cb) {
    // console.log('TransactionService.processPortfolioTransaction');

    var transactionError = function(msg) {
      sails.log.debug('TransactionService.processPortfolioTransaction: error processing transaction [' + transaction.id + ']: ' + msg);

      transaction.state = 'error';
      transaction.save(function(err, transaction) {
        if (err) {
          sails.log.debug('Error saving transaction [' + transaction.id + ']: ' + err)
        }

        sails.log.debug('TransactionService.processPortfolioTransaction: processed transaction [' + transaction.id + ']');
        return cb(null, portfolio);            
      });    

      return cb(msg);
    };

    this.findPortfolioHolding(portfolio, transaction.ticker, function(err, holding) {
      if (err) {
        return cb('Error processPortfolioTransaction: ' + err);
      }

      // console.dir('holding');console.dir(holding);

      // calculate portfolio and holding cost and cash impacts

      var cost = parseFloat(0);
      var cash = parseFloat(0);

      if (transaction.type === 'buy') {
        cost = parseFloat(transaction.price) * parseFloat(transaction.quantity);
        cash = parseFloat(cost) * parseFloat(-1);
      } 
      else if (transaction.type === 'sell') {
        if (holding.shares <= 0) {
          sails.log.warn('Warning: unable to calculate selling cost for transaction [' + transaction.id + ']: no holding of this ticker');
        }
        else if (holding.cost <= 0) {
          sails.log.warn('Warning: unable to calculate selling cost for transaction [' + transaction.id + ']: holding of this ticker has negative cost');
        }
        else {
          cost = (holding.cost / holding.shares) * transaction.quantity * -1;
          cash = transaction.price * transaction.quantity;
        }
      } 
      else  {
        return transactionError('Unknown type for transaction [' + transaction.id + ']: ' + transaction.type);
      }

      //validation

      //don't allow cash to go negative
      if (cash < 0 && (-1 * cash) > portfolio.cash) {
        return transactionError('Insufficient funds');
      }

      //don't sell things we don't have!
      if (cost < 0 && transaction.quantity > holding.shares) {
        return transactionError('Insuffient shares');
      }

      holding.transactionId = transaction.id;
      holding.shares += transaction.quantity * (cost > 0 ? 1 : -1);
      holding.cost += parseFloat(cost);

      portfolio.transactionId = transaction.id;
      portfolio.cash += parseFloat(cash);
      portfolio.cost += parseFloat(cost);

      transaction.state = 'processed';
      transaction.save(function(err, transaction) {
        if (err) {
          return cb('Error saving transaction [' + transaction.id + ']: ' + err)
        }

        sails.log.debug('TransactionService.processPortfolioTransaction: processed transaction [' + transaction.id + ']');
        return cb(null, portfolio);            
      });    

    });
  },

  processPortfolioTransactions(portfolio, transactions, cb) {
    var self = this;
    // console.log('TransactionService.processPortfolioTransactions');

    var left = transactions.length;

    _.each(_.sortBy(transactions, 'id'), function(transaction, i) {

      TickerService.getTickerDetails(transaction.ticker, function(err, ticker) {
        if (err) {        
          return cb('Error querying ticker [' + transaction.ticker + ']: ' + err);
        }
        else if (!ticker) {
          //TODO go find the new ticker!
          return cb('Ticker not found: ' + transaction.ticker);
        }

        if (typeof transaction.price === 'undefined') {
          transaction.price = ticker.price;
        }

        self.processPortfolioTransaction(portfolio, transaction, function(err) {
          if (err) {
            sails.log.warn('TransactionService.processPortfolioTransactions: Error processing transaction [' + transaction.id + '] on portfolio [' + portfolio.id + ']: ' + err);
            return;
          }

          if (!--left) {
            return cb(null, portfolio);            
          }
        });
      });
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

      var transactionsByPortfolio = _.groupBy(transactions, function(n) { return n.portfolioId });
      var left = Object.keys(transactionsByPortfolio).length;

      _.each(transactionsByPortfolio, function(transactions, portfolioId) {
        // console.log('processing transactions for portfolio [' + portfolioId + ']');

        Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
          if (err) {        
            return cb('Error querying portfolio [' + portfolioId + ']: ' + err);
          }
          else if (!portfolio) {
            return cb('Portfolio [' + portfolioId + '] not found');
          }

          self.processPortfolioTransactions(portfolio, transactions, function(err, portfolio) {
            if (err) {        
              return sails.log.warn('TransactionService.processAll: processPortfolioTransactions error: ' + err);
            }

            //TODO this fails when adding a new holding
            
            if (portfolio && !--left) {
              // console.log('---> saving portfolio [' + portfolio.id + ']');
              //only save and publish when processed all holdings for portfolio

              var done = function(err) {
                if (err) {
                  sails.log.warn('Error creating/saving/deleting portfolio holding: ' + err);
                }
              };

              _.each(portfolio.holdings, function(holding) {

                if (holding.shares <= 0) {
                  if (holding.id > 0) holding.destroy(done);
                }
                else if (holding.id == 0) {
                  PortfolioHolding.create(holding, done);
                }
                else {
                  holding.save(done); 
                }
              });

              portfolio.save(function(err, portfolio) {
                if (err) {    
                  sails.log.warn('Error saving portfolio [' + portfolioId + ']: ' + err);    
                  return cb();
                }

                Portfolio.publishUpdate(portfolio.id);
                return cb();
              });
            }
          });
        });
      });
    });
  }, 
}
