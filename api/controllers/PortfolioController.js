/**
 * PortfolioController
 *
 * @description :: Server-side logic for managing Portfolios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	findOne(req, res) {
    var portfolioId = req.params['id'];

    //console.log("PortfolioController.findOne: id=" + portfolioId);

    if (typeof portfolioId !== 'undefined') {
      PortfolioService.getPortfolioDetails(portfolioId, function(portfolio) {
        if (portfolio) {
          return res.json(portfolio);
        }
        else {
          return res.json({});
        }
      });
    }
    else {
      return res.json({});
    }
  },

};

