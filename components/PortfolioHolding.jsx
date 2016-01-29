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

  select() {
    this.props.selectHolding(this.props.data.id);
  },

  render() {
    return (     
      <tr onClick={this.select} className={this.props.data.updatedUp ? "flash-green drilldownable" : this.props.data.updatedDown ? "flash-red drilldownable" : "drilldownable"}>
        <th className={this.props.data.id == 0 ? "text-left text-muted" : "text-left"} scope="row">{this.props.data.ticker}</th>
        <td className={this.props.data.id == 0 ? "text-left text-muted" : "text-left"} width="100%">{this.props.data.name}</td>
        <td className={this.props.data.dirty ? "text-right text-muted" : "text-right"}>{this.props.data.shares}</td>
        <td className={this.props.data.id == 0 ? "text-right text-nowrap text-muted" : "text-nowrap text-right"}>{this.props.data.price}</td>
        <td className={this.props.data.id == 0 ? "text-left text-nowrap text-muted" : "text-nowrap text-left"}>(<span className={this.props.data.change > 0 ? "text-right text-nowrap text-success" : this.props.data.change < 0 ? "text-right text-nowrap text-danger" : "text-right text-nowrap"}>{this.props.data.percentChangeFormatted}</span>)</td>
        <td className={this.props.data.dirty ? "text-right text-muted" : "text-right"}>${this.props.data.value}</td>
        <td className={this.props.data.dirty ? "text-left text-muted" : "text-left"}>(<span className={this.props.data.returnPercent >= 0 ? "text-success" : this.props.data.returnPercent < 0 ? "text-danger" : ""}>{this.props.data.returnPercentFormatted}</span>)</td>
        <td className="text-right text-nowrap">
          <i className="material-icons">expand_more</i>        
        </td>
      </tr>
    );
  }
})
