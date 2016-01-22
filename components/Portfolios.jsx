var React = require("react");
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var Portfolio = require('./Portfolio.jsx');

module.exports = React.createClass({
  
  addPortfolio() {
    var self = this;
    var name = window.prompt("New Portfolio","My Portfolio");
    if (name) {
      var newPortfolio = {id: 0, name: name, cash: 10000, value: 10000, returnPercent: 0, returnPercentFormatted: '+0.00'}; //id will be updated later
      this.setState({data: this.state.data.concat(newPortfolio)}); 

      Api.post('portfolio', newPortfolio, function(data) { 
        //update new portfolio's id
        _.find(self.state.data, {id: newPortfolio.id}).id=data.id;
        self.setState({data: self.state.data});
      });
    }
  }, 

  deletePortfolio(id) {
    var portfolios = _.difference(this.state.data, _.filter(this.state.data, {id: id}));
    this.setState({data: portfolios});

    Api.delete('portfolio', id);
  },

  renamePortfolio(id, name) {
    var portfolio = _.find(this.state.data, {id: id});
    if (portfolio) {
      portfolio.name=name;
      this.setState({data: this.state.data});

      Api.put('portfolio', id, portfolio);
    }
  },

  fetchData() {
    //console.log('Portfolio.fetchData');
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

  socketIo(msg) {
    //console.log('Portfolio.socketIo'); //console.dir(msg);
    this.fetchData();
  },

  getInitialState() {
    this.componentName = 'Portfolio';
    this.componentDataUrl = 'portfolio';
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentWillMount() {
    //console.log('Portfolio.componentWillMount');
  }, 

  componentDidMount() {
    // console.log('Portfolio.componentDidMount');
    App.registerSocketIo(this.componentName, this.componentDataUrl, this.socketIo);
    this.fetchData();
  },  

  componentDidUpdate() {
    //console.log('Portfolio.componentDidUpdate');
    App.init();
  },

  componentWillUnmount() {
    //console.log('Portfolio.componentWillUnmount');
    App.registerSocketIo(this.componentName, this.componentDataUrl);
  },

  render: function() {
    var self = this;    
    var portfolios = [];

    if (this.state.data) {
      var portfolios = this.state.data.map(function(portfolio) {
        return (
          <Portfolio key={portfolio.id} id={portfolio.id} data={portfolio} deletePortfolio={self.deletePortfolio} renamePortfolio={self.renamePortfolio} viewPortfolio={self.viewPortfolio} />
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
