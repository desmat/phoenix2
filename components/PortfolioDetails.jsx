var _ = require('lodash');
var $ = require('jquery');
var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');

module.exports = React.createClass({

  fetchData() {
    var self = this;

    Api.get('portfolioDetails/' + this.props.params.id, function(data) { 
      self.setState({data: data}); 
    }, function(errorCode) {
      if (errorCode == 403) {
        App.logout();
        App.navigate('/login');
      }
    });
  },

  getInitialState() {
    return {data: Api.getInitial('portfolioDetails/' + this.props.params.id)};
  },  

  componentDidMount() {
    var self = this;
    io.socket.on('portfolioDetails/' + this.props.params.id, function (msg) {
      //quick and dirty for now
      self.fetchData();
    });

   self.fetchData();
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
        <h1>Portfolio: {this.state.data.name}</h1>
        <h2>Value: ${this.state.data.value}</h2>
        <h2>Cash: ${this.state.data.cash}</h2>
        <h2>Holdings</h2>
        <div className="portfolio-holdings row text-nowrap">
          {holdings}
        </div>

        <br/>
        <div className="text-center">
          <Link to="/" className="btn btn-default"><i className="fa fa-backward" aria-hidden="true"/> Back</Link> 
          &nbsp;<a onClick={this.addPortfolio} className="btn btn-primary">
            <i className="fa fa-plus" aria-hidden="true"/> Add Holding
          </a>
        </div>
      </div>
    );
  },



});