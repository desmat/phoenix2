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
    //console.log('PortfolioDetails.buyHolding(' + ticker + ')');
    ticker = ticker.toUpperCase();
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares + 1;
      this.setState({data: this.state.data});
      
      // Api.put('portfolioHolding', portfolioHolding.id, portfolioHolding, function(data) { 
      //   self.fetchData();
      // });

      Api.post('portfolio/' + this.state.data.id + '/buy/' + ticker, {}, function(data) { 
        //self.fetchData();
      });

    }
    //portfolio does not contain this holding
    else {
      portfolioHolding = {portfolioId: this.props.params.id, id:0, ticker:ticker, shares:1, cost:0};
      this.state.data.holdings = this.state.data.holdings.concat(portfolioHolding);
      this.setState({data: this.state.data}); //id will be updated later

      Api.post('portfolio/' + this.state.data.id + '/buy/' + ticker, {}, function(data) { 
        //self.fetchData();
      });
    }
  },

  sellHolding(ticker) {
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares - 1;      

      if (portfolioHolding.shares <= 0) {
        this.state.data.holdings = _.difference(this.state.data.holdings, _.filter(this.state.data.holdings, {ticker:ticker}));
        this.setState({data: this.state.data});
        
        Api.post('portfolio/' + this.state.data.id + '/sell/' + ticker, {}, function(data) { 
          //self.fetchData();
        });
      }
      else {
        this.setState({data: this.state.data});
        
        Api.post('portfolio/' + this.state.data.id + '/sell/' + ticker, {}, function(data) { 
          //self.fetchData();
        });
      }
    }
    //portfolio does not contain this holding
    else {
      console.log("Dude wtf");
    }
  },

  fetchData() {
    // console.log('PortfolioDetails.fetchData'); 
    var self = this;

    Api.get(this.componentDataUrl, function(data) { 
      //console.dir(data);
      self.setState({data: data}); 
    }, function(errorCode) {
      if (errorCode == 403) {
        App.logout();
        App.navigate('/login');
      }
    });
  },

  socketIo(msg) {
    //console.log('PortfolioDetails.socketIo'); console.dir(msg);
    if (msg.id == this.props.params.id) {
      this.fetchData();
    }
  },

  getInitialState() {
    // console.log('PortfolioDetails.getInitialState');
    this.componentName = 'PortfolioDetails';
    this.socketIoModel = 'portfolio';
    this.componentDataUrl = 'portfolio/' + this.props.params.id;
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentWillMount() {
    // console.log('PortfolioDetails.componentWillMount');
  },

  componentDidMount() {
    // console.log('PortfolioDetails.componentDidMount');
    //TODO: figure out why this won't kick in when loading this component from back-end
    App.registerSocketIo(this.componentName, this.socketIoModel, this.socketIo);
    this.fetchData();
  }, 

  componentDidUpdate() {
    // console.log('PortfolioDetails.componentDidUpdate');
    App.init();
  },

  componentWillUnmount() {
    // console.log('PortfolioDetails.componentWillUnmount');
    App.registerSocketIo(this.componentName, this.socketIoModel);
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
