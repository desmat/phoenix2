var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  drilldown() {
    App.navigate('/portfolio/' + this.props.id);
  },

  render() {
    return (
      <tr onClick={this.drilldown} className={this.props.data.updatedUp ? "flash-green drilldownable" : this.props.data.updatedDown ? "flash-red drilldownable" : "drilldownable"}>
        <td className={this.props.data.id == 0 ? "text-left text-muted" : "text-left"}>
          {this.props.data.name}
        </td>
        <td className={this.props.data.id == 0 ? "text-right text-nowrap text-muted" : "text-nowrap text-right"}>
          <span className={this.props.data.returnPercent >= 0 ? "text-success" : this.props.data.returnPercent < 0 ? "text-danger" : ""}>{this.props.data.returnPercentFormatted}</span>
        </td>
        <td className="text-right text-nowrap">
          <i className="material-icons">keyboard_arrow_right</i>
        </td>
      </tr>
    )
  }
});
