var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  buy() {
    this.props.buyHolding(this.props.data.ticker);
  },

  sell() {
    this.props.sellHolding(this.props.data.ticker);
  },

  render() {
    return (     
      <tr>
        <th className={this.props.data.id == 0 ? "text-right text-muted" : "text-left"} scope="row">{this.props.data.ticker}</th>
        <td className={this.props.data.id == 0 ? "text-right text-muted" : "text-left"} width="100%">{this.props.data.name}</td>
        <td className={this.props.data.dirty ? "text-right text-muted" : "text-right"}>{this.props.data.shares}</td>
        <td className={this.props.data.dirty ? "text-right text-muted" : "text-right"}>${this.props.data.value}</td>
        <td className={this.props.data.dirty ? "text-right text-muted" : "text-right"}>${this.props.data.cost}</td>
        <td className="text-right text-nowrap">
          <a href="#" onClick={this.sell} data-toggle="tooltip" title={`Sell some ${this.props.data.ticker}`}><i className="fa fa-remove" aria-hidden="true"/></a>
          &nbsp;<a href="#" onClick={this.buy} data-toggle="tooltip" title={`Buy some ${this.props.data.ticker}`}><i className="fa fa-plus" aria-hidden="true"/></a>
        </td>
      </tr>
    );
  }
})
