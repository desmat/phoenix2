var _ = require('lodash');
var React = require("react");
var Api = require('../assets/js/Api');

module.exports = React.createClass({
  getInitialState() {
    return {data: Api.getInitial('about')};
  },  

  componentDidMount() {
    var self = this;
    Api.get('about', function(data) { 
    	//console.log('got data');
      self.setState({data: data}); 
    });
  },

  render() {
    var sortByField = 'createdAt';
    var sortAscOrDesc = function(collection) {
      return collection;
    }

    return (
      <div>
      <p>Super secret project phoenix, rising from the ashes and all that...</p>
      <p>Documentation and source code: <a href='https://github.com/desmat/phoenix2'>https://github.com/desmat/phoenix2</a>.</p>

      {this.state.data.map(function(aboutText) {
  			return (
  				<p key={aboutText.id}>{aboutText.text}</p>
  			);
  		})}
      </div>
    )
  }
});
