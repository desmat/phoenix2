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
      {"ticker":"MSFT","shares":"2","cost":107.74,"portfolioId":1},{"ticker":"YHOO","shares":"3","cost":91.05,"portfolioId":1},{"ticker":"AAPL","shares":"1","cost":100.15,"id":3,"portfolioId":1},
      {"portfolioId":2,"ticker":"GOOG","shares":1,"cost":719.07},{"portfolioId":2,"ticker":"IBM","shares":2,"cost":265.76},
      {portfolioId: 3, ticker: 'AAPL', shares: 1, "cost":100.15}, {portfolioId: 3, ticker: 'AMZN', shares: 2, cost: 1200.00},
    ]
  }, 
  {
    Ticker: [
      {"ticker":"MSFT","name":"Microsoft Corporation","price":"53.48"},
      {"ticker":"YHOO","name":"Yahoo! Inc.","price":"30.46"},
      {"ticker":"AAPL","name":"Apple Inc.","price":"101.03"},      
      {"ticker":"GOOG","name":"Alphabet Inc.","price":"720.77"},
      {"ticker":"IBM","name":"International Business Machines","price":"133.0972"},
      {"ticker":"AMZN","name":"Amazon","price":"700.00"},
    ]
  },
];
