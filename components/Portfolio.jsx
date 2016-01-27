var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({
  delete() {
    this.props.deletePortfolio(this.props.id);
  },

  rename() {
    this.props.renamePortfolio(this.props.id);
  },

  render() {
    return (
      <tr className={this.props.data.updatedUp ? "flash-green" : this.props.data.updatedDown ? "flash-red" : ""}>
        <td className={this.props.data.id == 0 ? "text-left text-muted" : "text-left"}>
          <Link to={`/portfolio/${this.props.id}`} className="portfolio-item">{this.props.data.name}</Link>
        </td>
        <td className={this.props.data.id == 0 ? "text-right text-nowrap text-muted" : "text-nowrap text-right"}>
          <span className={this.props.data.returnPercent >= 0 ? "text-success" : this.props.data.returnPercent < 0 ? "text-danger" : ""}>{this.props.data.returnPercentFormatted}</span>
        </td>
        <td className="text-right text-nowrap">
          <a href='#' onClick={this.delete} data-toggle="tooltip" title="Delete"><i className="material-icons">clear</i></a>
          <a href='#' onClick={this.rename} data-toggle="tooltip" title="Rename"><i className="material-icons">edit</i></a>
        </td>
      </tr>
    )
  }
});
