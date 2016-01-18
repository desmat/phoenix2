var React = require("react");
var Api = require('../assets/js/Api');

module.exports = React.createClass({

  getInitialState() {
    this.componentDataUrl = 'about';
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentDidMount() {
    var self = this;
    Api.get(this.componentDataUrl, function(data) { 
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
      <h1></h1>
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
