var TickerService = require('../api/services/TickerService');
var TransactionService = require('../api/services/TransactionService');

/**
 * Jobs to be initialized at startup
 *
 */
module.exports.jobs = [
  {
    name: "Update Tickers", 
    interval: 1000 * 60 * 1, //every 1 mins
    job: function() {
      // sails.log.debug('*** Update Tickers Job ***');
      
      if (TickerService.isMarketOpen()) {
        //sails.log.debug("Job[Update Tickers]: Updating all tickers...");

        TickerService.updateAll(function() {
          //sails.log.debug("...Done!");
        });
      }
    }
  },
  {
    name: "Transaction Job", 
    interval: 500, 
    job: function() {
      //sails.log.debug('*** Transaction Job ***');

      TransactionService.processAll();
    }
  },
  {
    name: "Portfolio Job", 
    interval: 1000 * 60 * 1, //every 1 mins
    job: function() {
      // sails.log.debug('*** Portfolio Job ***');

      PortfolioService.processPortfolios();
    }
  },
]
