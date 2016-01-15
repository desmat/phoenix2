var TickerService = require('../api/services/TickerService');

/**
 * Jobs to be initialized at startup
 *
 */
module.exports.jobs = [
  {
    name: "Update Tickers", 
    interval: 1000 * 60, 
    job: function() {
      //console.log('*** Update Tickers ***');
      sails.log.debug("Updating all tickers...");
      TickerService.updateAll(function() {
        //sails.log.debug("...Done!");
      });

    }
  },
  // {
  //   name: "Job 2", 
  //   interval: 800, 
  //   job: function() {
  //     console.log('*** Job 2 ***');
  //   }
  // },
]
