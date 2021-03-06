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
    "value": {
      "type": "float",
      "required": false
    }, 
    "cost": {
      "type": "float",
      "required": false
    }, 
    "change": {
      "type": "float",
      "required": false
    }, 
    "percentChange": {
      "type": "float",
      "required": false
    }, 
    // "percentChangeFormatted": {
    //   "type": "string",
    //   "required": false
    // }, 
    "returnPercent": {
      "type": "float",
      "required": false
    }, 
    // "returnPercentFormatted": {
    //   "type": "string",
    //   "required": false
    // }, 

    portfolioId: {
      model: "portfolio"
    },

  }, 
  
};

