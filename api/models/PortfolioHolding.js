/**
* PortfolioHolding.js
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
    "shares": {
      "type": "float",
      "required": false
    },
    "cost": {
      "type": "float",
      "required": false
    }, 

    portfolioId: {
      model: "portfolio"
    },

  }, 

  beforeDestroy(portfolioHolding, cb) {
    //console.log('PortfolioHolding.beforeDestroy: '); console.dir(portfolioHolding);

    cb();
  },

  afterDestroy(portfolioHoldings, cb) {
    //console.log('PortfolioHolding.afterDestroy: '); console.dir(portfolioHoldings);

    _.each(portfolioHoldings, function(portfolioHolding) {
      Portfolio.publishUpdate(portfolioHolding.portfolioId);
    });
    cb();
  },  

  beforeUpdate(portfolioHolding, cb) {
    //console.log('PortfolioHolding.beforeUpdate: '); console.dir(portfolioHolding);

    PortfolioService.fillPortfolioHoldingDetails(portfolioHolding, function() {
      cb();
    });    
  },

  afterUpdate(portfolioHolding, cb) {
    //console.log('PortfolioHolding.afterUpdate: '); console.dir(portfolioHolding);

    Portfolio.publishUpdate(portfolioHolding.portfolioId);
    cb();
  },  

  beforeCreate(portfolioHolding, cb) {
    //console.log('PortfolioHolding.beforeCreate: '); console.dir(portfolioHolding);

    PortfolioService.fillPortfolioHoldingDetails(portfolioHolding, function() {
      cb();
    });    
  },

  afterCreate(portfolioHolding, cb) {
    //console.log('PortfolioHolding.afterCreate: '); console.dir(portfolioHolding);

    Portfolio.publishUpdate(portfolioHolding.portfolioId);
    cb();
  },

};

