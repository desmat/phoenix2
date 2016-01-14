var _ = require('lodash');
var $ = require('lodash');
var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({
  delete: function() {
    this.props.deletePortfolio(this.props.id);
  }, 

  rename: function() {
    var name = window.prompt("Rename Portfolio",this.props.name);
    if (name) { 
      this.props.renamePortfolio(this.props.id, name);
    }
  }, 

  render: function() {
    return (
      <div className="portfolio row text-nowrap">
        <div className="col-xs-8">          
          <Link to={`/portfolio/${this.props.id}`} className="portfolio-item">{this.props.name}</Link>
        </div>
        <div className="col-xs-4 text-right">
          <a href='#' onClick={this.delete} data-toggle="tooltip" title="Delete"><i className="fa fa-remove" aria-hidden="true"/></a> 
          &nbsp;<a href='#' onClick={this.rename} data-toggle="tooltip" title="Rename"><i className="fa fa-pencil" aria-hidden="true"/></a>
        </div>
      </div>
    );
  }
});