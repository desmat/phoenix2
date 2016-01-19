

module.exports = {

  process(cb) {
    if (!cb) cb = function() {};

    Transaction.find({state: 'new'}).sort('id ASC').exec(function(err, transactions) {
      if (err) {
        sails.log.warn('Error processing transactions: ' + err);
        return cb();
      }

      //if (transactions.length > 0) console.log('TransactionService.process: processing ' + transactions.length + ' transaction(s)');
      
      _.each(transactions, function(transaction) {
        console.log('TransactionService.process: processing transaction [' + transaction.id + ']');

        try {
          var data = JSON.parse(transaction.data);
          //console.log('transaction data: '); console.dir(data);

          if (transaction.type == 'portfolio') {
            PortfolioTransaction.findOne({transactionId: transaction.id}).limit(1).exec(function(err, portfolioTransaction) {
              if (err) {
                sails.log.warn('Error processing transaction [' + transaction.id + ']: ' + err);
                transaction.state = 'error';
                transaction.save();
              }
              else if (portfolioTransaction) {
                sails.log.warn('Transaction [' + transaction.id + '] already processed: skipping');
                transaction.state = 'processed';
                transaction.save();                
              }
              else {
                //TODO safety check: only go ahead with transaction if the ticker's record was updated after this transaction  
                Ticker.findOne({ticker: data.ticker}, function(err, ticker) {
                  if (err) {
                    sails.log.warn('Error processing transaction [' + transaction.id + ']: Error getting ticker data: ' + err);
                    transaction.state = 'error';
                    transaction.save();
                  }
                  else if (!ticker) {
                    sails.log.warn('Error processing transaction [' + transaction.id + ']: Ticker data not found');
                  }
                  else {
                    portfolioTransaction = {};
                    portfolioTransaction.transactionId = transaction.id;
                    portfolioTransaction.portfolioId = data.portfolioId;
                    portfolioTransaction.type = data.type;
                    portfolioTransaction.ticker = data.ticker;
                    portfolioTransaction.price = ticker.price;

                    //console.log('about to insert this portfolioTransaction: '); console.dir(portfolioTransaction);
                    PortfolioTransaction.create(portfolioTransaction, function(err) {
                      if (err) {
                        sails.log.warn('Error processing transaction [' + transaction.id + ']: Error creating new PortfolioTransaction: ' + err);
                      }

                      //notify portfolio to update front-end
                      Portfolio.publishUpdate(data.portfolioId);                        

                      transaction.state = 'processed';
                      transaction.save();
                    });
                  }
                });
              }
            });
          }
        }
        catch (error) {
          sails.log.warn('Error processing transaction [' + transaction.id + ']: ' + error);
        }
      });

      return cb();
    });
  }, 

  processPortfolio(cb) {
    if (!cb) cb = function() {};

    //TODO
    //PortfolioTransaction.find({})
  },

}
