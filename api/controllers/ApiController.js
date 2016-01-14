/**
 * ApiController: overwrite default api end-points
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // portfolios(req, res) {
  //   return res.json([{"name":"My Practice Portfolio","cash":10000,"id":1},{"name":"Things I'm Watching","cash":10000,"id":2}]);
  // },

  portfolioDetails(req, res) {
    //console.log('api.portfolioDetail');
    if (req.params['id'] === '1') {
      return res.json({"name":"My Practice Portfolio","cash":10000,"id":1,"holdings":[{"ticker":"MSFT","name":"Microsoft Corporation","shares":"2","cost":107.74,"checkpointTransactionId":4,"id":1,"portfolioId":1,"price":"53.48"},{"ticker":"YHOO","name":"Yahoo! Inc.","shares":"3","cost":91.05,"checkpointTransactionId":4,"id":2,"portfolioId":1,"price":"30.46"},{"ticker":"AAPL","name":"Apple Inc.","shares":"1","cost":100.15,"checkpointTransactionId":4,"id":3,"portfolioId":1,"price":"101.03"}],"cashCalculated":9701.06,"valueCalculated":10000.43});
    }
    else if (req.params['id'] === '2') {
      return res.json({"name":"Things I'm Watching","cash":10000,"id":2,"holdings":[{"portfolioId":2,"ticker":"GOOG","name":"Alphabet Inc.","shares":1,"cost":719.07,"price":"720.77"},{"portfolioId":2,"ticker":"IBM","name":"International Business Machines","shares":2,"cost":265.76,"price":"133.0972"}],"cashCalculated":9015.17,"valueCalculated":10002.13});
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

