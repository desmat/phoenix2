/**
 * ApiController: overwrite default api end-points
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  portfolioDetails(req, res) {
    var portfolioId = req.params['id'];

    // console.log('ApiController.portfolioDetail: portfolioId=' + portfolioId);

    if (typeof portfolioId !== 'undefined') {
      Portfolio.findOne({id: portfolioId}, function(err, portfolio) {
        //console.log('here'); console.dir(portfolio);
        if (err) {        
          console.log('ApiController.portfolioDetails: Portfolio.findOne error: ' + err);
          return res.json({error: "Error: " + err});
        }

        if (portfolio) {
          PortfolioHolding.find({portfolioId: portfolioId}, function(err, portfolioHoldings) {
            if (err) {        
              console.log('ApiController.portfolioDetails: PortfolioHolding.find error: ' + err);
              return res.json({error: "Error: " + err});
            }

            portfolio['holdings'] = portfolioHoldings;
            return res.json(portfolio);
          });
        }
        else {
          return res.json({});
        }
      });
    }
    else {  
      return res.json({});
    }
  },

  login(req, res) {
    // console.log('api controller login');

    if (!req.hasOwnProperty('body') || !req.body.hasOwnProperty('username') || 
        !req.body.hasOwnProperty('password') || !req.body.username || !req.body.password) {
      return res.json({error: "Username or password missing"});
    }

    User.findOne({username: req.body.username, password: req.body.password}, function(err, result) {
      if (err) {        
        //console.log('Login error: ' + err);
        return res.json({error: "Error: " + err});
      }
      else if (!result) {
        return res.json({error: "Invalid credentials"});
      }

      //all good!
      req.session.authenticated = true;  
      req.session.userId = result.id;  

      return res.json({login: "ok"});
    });
  }, 

  register(req, res) {
    //console.log('api controller register');

    if (!req.hasOwnProperty('body') || !req.body.hasOwnProperty('username') || 
        !req.body.hasOwnProperty('password') || !req.body.username || !req.body.password) {
      return res.json({error: "Username or password missing"});
    }

    //look for existing username
    User.findOne({username: req.body.username}, function(err, result) {
      if (err) {
        //console.log('Register error: ' + err);
        return res.json({error: "Error: " + err});
      }
      else if (result) {
        return res.json({error: "Username exists"});
      }

      //username not found, create
      User.create({username: req.body.username, password: req.body.password}, function(err, result) {
        if (err) {
          //console.log('Register error: ' + err);
          return res.json({error: "Error: " + err});
        }
        else if (!result) {
          //console.log('Register error: (unknown)');
          return res.json({error: "Unknown error"});
        }

        //all good!
        req.session.authenticated = true;  
        req.session.userId = result.id;  

        return res.json({register: "ok"});
      });
    });
  },  

  logout(req, res) {
    //console.log('api controller logout');

    delete req.session.authenticated;    
    delete req.session.userId;

    return res.json({result: "ok"});
  },  
};

