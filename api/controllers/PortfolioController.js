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

  buy(req, res) {
    var portfolioId = req.param('id');
    var ticker = req.param('ticker');
    var quantity = req.param('quantity') || 1;
    console.log('PortfolioController.buy: id=' + portfolioId, ' ticker=' + ticker + ' quantity=' + quantity);

    PortfolioService.buyOrSell(portfolioId, ticker, 'buy', quantity, function(err) {
      if (err) {
        sails.log.warn(err);
        return res.json({error: 'Error buying ticker [' + ticker + ']: ' + err});
      }

      return res.json({});
    });
  }, 

  sell(req, res) {
    var portfolioId = req.params['id'];
    var ticker = req.params['ticker'];
    var quantity = req.param('quantity') || 1;
    //console.log('PortfolioController.sell: id=' + portfolioId, ' ticker=' + ticker);

    PortfolioService.buyOrSell(portfolioId, ticker, 'sell', quantity, function(err) {
      if (err) {
        sails.log.warn(err);
        return res.json({error: 'Error selling ticker [' + ticker + ']: ' + err});
      }

      return res.json({});
    });
  }, 

};

