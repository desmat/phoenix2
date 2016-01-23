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
      {userId:3, "name":"Initialized From Transactions","cash":20000},
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
/*
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
// {ticker: 'MSFT'},
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
*/      
    ]
  },
  {
    Transaction: [
      // {type: 'buy', portfolioId: 3, ticker: 'AMZN'},
      {type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 2, price: '100'},
      {type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 3, price: '150'},
      {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 1, price: '50'},
      // // {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 2, price: '100'},
// {type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 175, price:  57.1429},
// {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 43, price:  115},
// {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 15, price:  128.8},
// {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 15, price:  96.05},
// {type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 20, price:  252.24 },
// {type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 7, price: 311.54 },
// {type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 8, price: 303.23 },
// {type: 'buy', portfolioId: 3, ticker: 'GOOG', quantity: 5, price: 534.99 },
// {type: 'buy', portfolioId: 3, ticker: 'GOOG', quantity: 5, price: 600.3499 },
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 24, price:  205.77 },
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  188.43},
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  183.55 },
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 5, price: 197.85 },
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 9, price: 162.5},
// {type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  152.74 },
// {type: 'buy', portfolioId: 3, ticker: 'FB', quantity: 42, price:  59.37},
// {type: 'buy', portfolioId: 3, ticker: 'YELP', quantity: 90, price:  28.01},
// {type: 'sell', portfolioId: 3, ticker: 'YELP', quantity: 45, price:  55.9501},
// {type: 'buy', portfolioId: 3, ticker: 'NEWR', quantity: 65, price:  33.2 },
// {type: 'buy', portfolioId: 3, ticker: 'FEYE', quantity: 80, price:  30.46},
// {type: 'buy', portfolioId: 3, ticker: 'TWTR', quantity: 40, price: 50 },
// {type: 'buy', portfolioId: 3, ticker: 'CRCM', quantity: 90, price:  22.26},
// {type: 'buy', portfolioId: 3, ticker: 'CRCM', quantity: 90, price:  12.3299},
// {type: 'sell', portfolioId: 3, ticker: 'AMZN', quantity: 15, price:  313.77},
// {type: 'sell', portfolioId: 3, ticker: 'AMZN', quantity: 4, price: 580.415},
// {type: 'sell', portfolioId: 3, ticker: 'GOOG', quantity: 1, price: 697.6101},

    ]
  }
];
