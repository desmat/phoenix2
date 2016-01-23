/**
* Transaction.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    type: {
      type: "string", 
      required: true
    }, 
    portfolioId: {
      type: "integer", 
      required: true
    }, 
    ticker: {
      type: "string", 
      required: true
    },
    quantity: {
      type: "integer", 
      required: true,
      defaultsTo: 1
    },
    price: {
      type: "float", 
      required: false,
    },
    state: {
      type: "string", 
      required: true, 
      defaultsTo: 'new'
    }
  }
};

