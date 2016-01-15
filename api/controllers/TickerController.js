/**
 * TickerController
 *
 * @description :: Server-side logic for managing Tickers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
  updateAll(req, res) {
    res.write("Updating all tickers...");
    TickerService.updateAll(function() {
      res.write("Done!");
      res.end();
      return;
    });
  }
};

