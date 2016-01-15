/**
 * PortfolioController
 *
 * @description :: Server-side logic for managing Portfolios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	findOne(req, res) {
    var portfolioId = req.params['id'];

    console.log("PortfolioController.findOne: id=" + portfolioId);

    if (typeof portfolioId !== 'undefined') {
      Portfolio.findOne({id: portfolioId}).populate('holdings').exec(function(err, portfolio) {
        if (err) {        
          console.log('ApiController.portfolioDetails: Portfolio.findOne error: ' + err);
          return res.json({error: "Error: " + err});
        }

        if (portfolio) {
          //TODO fill live values from ticker table
          // _.each(portfolio.holdings, function(holding) {
          //   holding.name = 'XXX';
          // });

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

