var React = require("react");
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var Portfolio = require('./Portfolio.jsx');

module.exports = React.createClass({
  addPortfolio: function() {
    var self = this;
    var name = window.prompt("New Portfolio","My Portfolio");
    if (name) {
      var newPortfolio = {id: 0, name: name, cash: 10000}; //id will be updated later
      this.setState({data: this.state.data.concat(newPortfolio)}); 

      Api.post('portfolio', newPortfolio, function(data) { 
        //update new portfolio's id
        _.find(self.state.data, {id: newPortfolio.id}).id=data.id;
        self.setState({data: self.state.data});
      });
    }
  }, 

  deletePortfolio: function(id) {
    var portfolios = _.difference(this.state.data, _.filter(this.state.data, {id: id}));
    this.setState({data: portfolios});

    Api.delete('portfolio', id);
  },

  renamePortfolio: function(id, name) {
    var portfolio = _.find(this.state.data, {id: id});
    if (portfolio) {
      portfolio.name=name;
      this.setState({data: this.state.data});

      Api.put('portfolio', id, portfolio);
    }
  },

  fetchData() {
    var self = this;

    Api.get(this.componentDataUrl, function(data) { 
      self.setState({data: data}); 
    }, function(errorCode) {
      if (errorCode == 403) {
        App.logout();
        App.navigate('/login');
      }
    });
  },

  getInitialState() {
    this.componentDataUrl = 'portfolio';
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentDidMount() {
    var self = this;

    io.socket.on(this.componentDataUrl, function (msg) {
      //quick and dirty for now
      self.fetchData();
    });

    self.fetchData();
  },  

  componentDidUpdate() {
    App.init();
  },

  render: function() {
    var self = this;    
    var portfolios = [];

    if (this.state.data) {
      var portfolios = this.state.data.map(function(portfolio) {
        return (
          <Portfolio key={portfolio.id} name={portfolio.name} id={portfolio.id} data={self.state.data} deletePortfolio={self.deletePortfolio} renamePortfolio={self.renamePortfolio} viewPortfolio={self.viewPortfolio} />
        );
      });
    }

    return (
      <div className="portfolio-list-container">
        <h2>Portfolios</h2>
        <div className="portfolio-list">
          {portfolios}
          <br/>
          <div className="text-center">
            <a onClick={this.addPortfolio} className="btn btn-primary">
              <i className="fa fa-plus" aria-hidden="true"/> New Portfolio
            </a>
          </div>
        </div>
      </div>

    );
  }
});
