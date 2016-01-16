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
    state: {
      type: "string", 
      required: true, 
      defaultsTo: 'new'
    }
  }
};
