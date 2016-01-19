var TickerService = require('../api/services/TickerService');
var TransactionService = require('../api/services/TransactionService');

/**
 * Jobs to be initialized at startup
 *
 */
module.exports.jobs = [
  {
    name: "Update Tickers", 
    interval: 1000 * 60 * 60, //let's just start with every hour then we'll ramp it up
    job: function() {
      sails.log.debug('*** Update Tickers Job ***');
      //TODO make sure we're only getting data when market open
      
      if (TickerService.isMarketOpen()) {
        sails.log.debug("Updating all tickers...");

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
      //sails.log.debug('*** Transaction Job2 ***');

      TransactionService.process();
    }
  },
]
