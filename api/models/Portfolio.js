/**
* Portfolio.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    "name": {
      "type": "string",
      "required": true
    },
    "cash": {
      "type": "float",
      "required": false
    },
    "value": {
      "type": "float",
      "required": false
    },
    // "returnPercent": {
    //   "type": "float",
    //   "required": false
    // },
    // "returnPercentFormatted": {
    //   "type": "string",
    //   "required": false
    // },

    holdings: {
      collection: "portfolioHolding",
      via: "portfolioId",
    },

  }
};

