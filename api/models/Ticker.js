/**
* Ticker.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    "ticker": {
      "type": "string",
      "required": true
    },
    "name": {
      "type": "string",
      "required": false
    },
    "price": {
      "type": "float",
      "required": false
    },

  }, 

  afterUpdate(ticker, cb) {
    //console.log('Ticker.afterUpdate: '); console.dir(ticker);

    PortfolioHolding.find({ticker: ticker.ticker}, function(err, portfolioHoldings) {
      _.each(portfolioHoldings, function(portfolioHolding) {
        //ping front-end to fetch fresh data
        Portfolio.publishUpdate(portfolioHolding.portfolioId);
      });

      cb();
    });
  },  


};

