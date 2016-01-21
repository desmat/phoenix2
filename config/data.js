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
      {userId:1, "name":"My Practice Portfolio","cash":9700.63},
      {userId:2, "name":"Things I'm Watching","cash":9013.0356},
    ]    
  }, 
  { 
    PortfolioHolding: [
      {
        "portfolioId": 1,
        "id": 1,
        "ticker": "AAPL",
        "shares": 1,
        "cost": 101.03,
      },
      {
        "portfolioId": 1,
        "id": 2,
        "ticker": "MSFT",
        "shares": 2,
        "cost": 106.96,
      },
      {
        "portfolioId": 1,
        "ticker": "YHOO",
        "shares": 3,
        "cost": 91.38,
      },
      {
        "portfolioId": 2,
        "ticker": "GOOG",
        "shares": 1,
        "cost": 720.77,
      },
      {
        "portfolioId": 2,
        "ticker": "IBM",
        "shares": 2,
        "cost": 266.1944,
      }
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

// {ticker: 'AAPL'},
{ticker: 'AXP'}, 
{ticker: 'BA'},  
{ticker: 'CAT'}, 
{ticker: 'CSCO'},
{ticker: 'CVX'}, 
{ticker: 'DD'},  
{ticker: 'DIS'}, 
{ticker: 'GE'},  
{ticker: 'GS'},  
{ticker: 'HD'},  
// {ticker: 'IBM'}, 
{ticker: 'INTC'},
{ticker: 'JNJ'}, 
{ticker: 'JPM'}, 
{ticker: 'KO'},  
{ticker: 'MCD'}, 
{ticker: 'MMM'}, 
{ticker: 'MRK'}, 
{ticker: 'MSFT'},
{ticker: 'NKE'}, 
{ticker: 'PFE'}, 
{ticker: 'PG'},  
{ticker: 'TRV'}, 
{ticker: 'UNH'}, 
{ticker: 'UTX'}, 
{ticker: 'V'},
{ticker: 'VZ'},  
{ticker: 'WMT'}, 
{ticker: 'XOM'}, 
      
    ]
  },
];
