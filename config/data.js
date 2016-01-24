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
      {
        "username": "Admin", 
        "password": "Password1", 
        "admin": true
      },
    ]
  },
  {
    Portfolio: [
      {userId:1, "name":"My Practice Portfolio","cash":9700.63},
      {userId:2, "name":"Things I'm Watching","cash":9013.0356},
      {userId:3, "name":"Initialized From Transactions","cash":48278.85},
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
      },
      // {
      //   "portfolioId": 3,
      //   "id": 1,
      //   "ticker": "AAPL",
      //   "shares": 1,
      //   "cost": 100,
      // },

    ]
  }, 
  {
    Ticker: [
      // {"ticker":"MSFT","name":"Microsoft Corporation","price":"53.48"},
      // {"ticker":"YHOO","name":"Yahoo! Inc.","price":"30.46"},
      // {"ticker":"AAPL","name":"Apple Inc.","price":"101.42"},      
      // {"ticker":"GOOG","name":"Alphabet Inc.","price":"596.38"},
      // {"ticker":"IBM","name":"International Business Machines","price":"133.0972"},
      // {"ticker":"AMZN","name":"Amazon","price":"700.00"},
      // {"ticker":"YELP","name":"Yelp Inc","price":"21.73"},
      // {"ticker":"TWTR","name":"Twitter","price":"17.84"},
      // {"ticker":"CRCM","name":"Twitter","price":"6.20"},
      // {"ticker":"FB","name":"Facebook","price":"97.94"},
      // {"ticker":"FEYE","name":"Fire Eye","price":"16.03"},
      // {"ticker":"NEWR","name":"New Relic","price":"29.47"},
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

    {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "price": 52.29,
        "change": 1.81,
        "percentChange": 3.59
    },
    {
        "ticker": "YHOO",
        "name": "Yahoo! Inc.",
        "price": 29.75,
        "change": 0.44,
        "percentChange": 1.5
    },
    {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "price": 101.42,
    },
    {
        "ticker": "GOOG",
        "name": "Alphabet Inc.",
        "price": 725.25,
        "change": 18.66,
        "percentChange": 2.64
    },
    {
        "ticker": "IBM",
        "name": "International Business Machines",
        "price": 122.5,
        "change": -0.41,
        "percentChange": -0.33
    },
    {
        "ticker": "AMZN",
        "name": "Amazon.com, Inc.",
        "price": 596.38,
        "change": 21.36,
        "percentChange": 3.71
    },
    {
        "ticker": "YELP",
        "name": "Yelp Inc. Class A Common Stock",
        "price": 21.73,
    },
    {
        "ticker": "TWTR",
        "name": "Twitter, Inc. Common Stock",
        "price": 17.84,
    },
    {
        "ticker": "CRCM",
        "name": "Care.com, Inc. Common Stock",
        "price": 6.2,
    },
    {
        "ticker": "FB",
        "name": "Facebook, Inc.",
        "price": 97.94,
    },
    {
        "ticker": "FEYE",
        "name": "FireEye, Inc.",
        "price": 16.03,
    },
    {
        "ticker": "NEWR",
        "name": "New Relic, Inc. Common Stock",
        "price": 29.47,
    }




    ]
  },
  {
    Transaction: [
      // {type: 'buy', portfolioId: 3, ticker: 'AMZN', price: '600'},
      // {type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 2, price: '100'},
      // {type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 3, price: '150'},
      // {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 1, price: '200'},
      // {type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 2, price: '100'},
{type: 'buy', portfolioId: 3, ticker: 'AAPL', quantity: 175, price:  57.1429},
{type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 20, price:  252.24 },
{type: 'buy', portfolioId: 3, ticker: 'YELP', quantity: 90, price:  28.01},
{type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 24, price:  205.77 },
{type: 'sell', portfolioId: 3, ticker: 'YELP', quantity: 45, price:  55.9501},
{type: 'sell', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  188.43},
{type: 'sell', portfolioId: 3, ticker: 'AMZN', quantity: 15, price:  313.77},
{type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  152.74 },
{type: 'buy', portfolioId: 3, ticker: 'TWTR', quantity: 40, price: 50 },
{type: 'buy', portfolioId: 3, ticker: 'CRCM', quantity: 90, price:  22.26},
{type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 7, price: 311.54 },
{type: 'buy', portfolioId: 3, ticker: 'CRCM', quantity: 90, price:  12.3299},
{type: 'buy', portfolioId: 3, ticker: 'GOOG', quantity: 5, price: 534.99 },
{type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 5, price: 197.85 },
{type: 'buy', portfolioId: 3, ticker: 'FB', quantity: 42, price:  59.37},
{type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 9, price: 162.5},
{type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 43, price:  115},
{type: 'buy', portfolioId: 3, ticker: 'FEYE', quantity: 80, price:  30.46},
{type: 'buy', portfolioId: 3, ticker: 'AMZN', quantity: 8, price: 303.23 },
{type: 'buy', portfolioId: 3, ticker: 'IBM', quantity: 12, price:  183.55 },
{type: 'buy', portfolioId: 3, ticker: 'NEWR', quantity: 65, price:  33.2 },
{type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 15, price:  128.8},
{type: 'buy', portfolioId: 3, ticker: 'GOOG', quantity: 5, price: 600.3499 },
{type: 'sell', portfolioId: 3, ticker: 'AAPL', quantity: 15, price:  96.05},
{type: 'sell', portfolioId: 3, ticker: 'AMZN', quantity: 4, price: 580.415},
{type: 'sell', portfolioId: 3, ticker: 'GOOG', quantity: 1, price: 697.6101},


    ]
  }
];
