/**
 * PortfolioController
 *
 * @description :: Server-side logic for managing Portfolios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  findOne(req, res) {
    var portfolioId = req.params['id'];
    // console.log("PortfolioController.findOne: id=" + portfolioId);

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

  trade(req, res) {
    var portfolioId = req.param('id');
    var ticker = req.param('ticker');
    var quantity = req.param('quantity') || 1;
    var buyOrSell = quantity > 0 ? 'buy' : 'sell';
    quantity = Math.abs(quantity);
    console.log('PortfolioController.' + buyOrSell + ': id=' + portfolioId, ' ticker=' + ticker + ' quantity=' + quantity);

    PortfolioService.trade(portfolioId, ticker, buyOrSell, quantity, function(err) {
      if (err) {
        sails.log.warn(err);
        return res.json({error: 'Error buying ticker [' + ticker + ']: ' + err});
      }

      return res.json({});
    });
  }, 

};

