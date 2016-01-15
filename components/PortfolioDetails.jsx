var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');

module.exports = React.createClass({


  addHolding() {
    var ticker = window.prompt("Ticker");
    if (ticker) {
      this.buyHolding(ticker);
    }
  },

  buyHolding(ticker) {
    ticker = ticker.toUpperCase();
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares + 1;
      this.setState({data: this.state.data});
      
      Api.put('portfolioHolding', portfolioHolding.id, portfolioHolding, function() { 
          self.fetchData(); 
      });
    }
    //portfolio does not contain this holding
    else {
      portfolioHolding = {portfolioId: this.props.params.id, id:0, ticker:ticker, shares:1, cost:0};
      this.state.data.holdings = this.state.data.holdings.concat(portfolioHolding);
      console.dir(this.state.data);
      this.setState({data: this.state.data}); //id will be updated later

      Api.post('portfolioHolding', portfolioHolding, function(data) { 
        //update new portfolio's id
        _.find(self.state.data.holdings, {id: portfolioHolding.id}).id=data.id;
        self.setState({data: self.state.data});

        self.fetchData();
      });
    }
  },

  sellHolding: function(ticker) {
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares - 1;      

      if (portfolioHolding.shares <= 0) {
        this.state.data.holdings = _.difference(this.state.data.holdings, _.filter(this.state.data.holdings, {ticker:ticker}));
        this.setState({data: this.state.data});
        
        Api.delete('portfolioHolding', portfolioHolding.id, function() { 
          self.fetchData(); 
        });
      }
      else {
        this.setState({data: this.state.data});
        
        Api.put('portfolioHolding', portfolioHolding.id, portfolioHolding, function() { 
          self.fetchData(); 
        });
      }
    }
    //portfolio does not contain this holding
    else {
      console.log("Dude wtf");
    }
  },

  fetchData() {
    var self = this;

    Api.get(this.componentDataUrl, function(data) { 
      self.setState({data: data}); 
    }, function(errorCode) {
      if (errorCode == 403) {
        App.logout();
        App.navigate('/login');
      }
    });
  },

  getInitialState() {
    this.componentDataUrl = 'portfolio/' + this.props.params.id;
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentDidMount() {
    var self = this;

    io.socket.on(this.componentDataUrl, function (msg) {
      //quick and dirty for now
      self.fetchData();
    });

    self.fetchData();
  }, 

  componentDidUpdate() {
    App.init();
  },

  render: function() {    
    var self = this;

    var holdings = _.sortBy(this.state.data.holdings, 'ticker').map(function(holding) {
      return (  
        <PortfolioHolding key={holding.id} data={holding}  buyHolding={self.buyHolding} sellHolding={self.sellHolding}/>
      );
    });

    return(
      <div className="portfolio-details">
        <h2>Portfolio: {this.state.data.name}</h2>
        <h3>Value: ${this.state.data.value}</h3>
        <h3>Cash: ${this.state.data.cash}</h3>
        <h3>Holdings</h3>
        <div className="portfolio-holdings row text-nowrap">
          {holdings}
        </div>

        <br/>
        <div className="text-center">
          <Link to="/" className="btn btn-default"><i className="fa fa-backward" aria-hidden="true"/> Back</Link> 
          &nbsp;<a onClick={this.addHolding} className="btn btn-primary">
            <i className="fa fa-plus" aria-hidden="true"/> Add Holding
          </a>
        </div>
      </div>
    );
  },



});