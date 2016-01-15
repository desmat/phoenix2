var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({
  
  buy: function() {
    this.props.buyHolding(this.props.data.ticker);
  },

  sell: function() {
    this.props.sellHolding(this.props.data.ticker);
  },

  render : function() {
    return (
      <div className="portfolio-holding">
        <div className="col-xs-8">          
          {this.props.data.name} ({this.props.data.ticker}): {this.props.data.shares} shares, ${this.props.data.value} value, ${this.props.data.cost} cost
        </div>

        <div className="col-xs-4 text-right">
          <a href="#" onClick={this.sell} data-toggle="tooltip" title={`Sell some ${this.props.data.ticker}`}><i className="fa fa-remove" aria-hidden="true"/></a> 
          &nbsp;<a href="#" onClick={this.buy} data-toggle="tooltip" title={`Buy some ${this.props.data.ticker}`}><i className="fa fa-plus" aria-hidden="true"/></a>      
        </div>        
      </div>
    );
  }
})