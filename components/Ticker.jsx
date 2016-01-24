var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({
  delete() {
    this.props.delete(this.props.data.id);
  },

  render() {
    return (
      <tr className={this.props.data.updatedUp ? "flash-green" : this.props.data.updatedDown ? "flash-red" : ""}>
        <th className={this.props.data.id == 0 ? "text-right text-muted" : "text-right"} scope="row">{this.props.data.ticker}</th>
        <td className={this.props.data.id == 0 ? "text-left text-muted" : "text-left"}>{this.props.data.name}</td>
        <td className={this.props.data.id == 0 ? "text-right text-nowrap text-muted" : "text-nowrap text-right"}>{this.props.data.price}</td>
        <td className={this.props.data.id == 0 ? "text-left text-nowrap text-muted" : "text-nowrap text-left"}>(<span className={this.props.data.change > 0 ? "text-right text-nowrap text-success" : this.props.data.change < 0 ? "text-right text-nowrap text-danger" : "text-right text-nowrap"}>{this.props.data.percentChangeFormatted}</span>)</td>
        <td className="text-right text-nowrap">
          <a href="#" onClick={this.delete} data-toggle="tooltip" title={`Delete ${this.props.data.ticker}`}><i className="fa fa-remove" aria-hidden="true"/></a>
        </td>
      </tr>

    );
  }
});
