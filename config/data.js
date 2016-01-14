/**
 * Initial data to load in api models.
 *
 * Expected is an array of records in the form:
 *  [
 *    ModelName: [
 *      {
 *        attributeName: "value", 
 *        otherAttribute: "otherValue"
 *      },
 *      {
 *        attributeName: "yet another", 
 *        otherAttribute: "and so forth"
 *      },
 *    ], 
 *    OtherModel: [
 *      ...
 *    ]
  * ]
 */
module.exports.data = [
  {
    User: [
      {
        "username": "Demo1", 
        "password": "Password1"
      },
      {
        "username": "Demo2", 
        "password": "Password1"
      },
    ]
  },
  {
    Portfolio: [
      {userId:1, "name":"My Practice Portfolio","cash":10000},
      {userId:2, "name":"Things I'm Watching","cash":10000},
      {"name":"With PortfolioHoldings","cash":10000},
    ]    
  }, 
  { 
    PortfolioHolding: [
      {"ticker":"MSFT","name":"Microsoft Corporation","shares":"2","cost":107.74,"checkpointTransactionId":4,"id":1,"portfolioId":1,"price":"53.48"},{"ticker":"YHOO","name":"Yahoo! Inc.","shares":"3","cost":91.05,"checkpointTransactionId":4,"id":2,"portfolioId":1,"price":"30.46"},{"ticker":"AAPL","name":"Apple Inc.","shares":"1","cost":100.15,"checkpointTransactionId":4,"id":3,"portfolioId":1,"price":"101.03"},
      {"portfolioId":2,"ticker":"GOOG","name":"Alphabet Inc.","shares":1,"cost":719.07,"price":"720.77"},{"portfolioId":2,"ticker":"IBM","name":"International Business Machines","shares":2,"cost":265.76,"price":"133.0972"},
      {portfolioId: 3, ticker: 'AAPL', shares: 1}, {portfolioId: 3, ticker: 'AMNZ', shares: 2},
    ]
  }
];
