var React = require("react");
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var Portfolio = require('./Portfolio.jsx');

module.exports = React.createClass({

  addPortfolio() {
    var self = this;
    var name = $('#portfolioName').val();
    if (name) {
      var newPortfolio = {id: 0, name: name, cash: 10000, value: 10000, returnPercent: 0, returnPercentFormatted: '+0.00'}; //id will be updated later
      this.setState({data: this.state.data.concat(newPortfolio)}); 

      $('#addPortfolioModal').modal('hide');
      
      Api.post('portfolio', newPortfolio, function(data) { 
        //update new portfolio's id
        _.find(self.state.data, {id: newPortfolio.id}).id=data.id;
        self.setState({data: self.state.data});
      });
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
    var self = this;
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
      var portfolios = _.sortBy(this.state.data, function(n) { return n.name.toLowerCase(); }).map(function(portfolio) {
        return (
          <Portfolio key={portfolio.id} id={portfolio.id} data={portfolio} deletePortfolio={self.deletePortfolio} renamePortfolio={self.renamePortfolio} viewPortfolio={self.viewPortfolio} />
        );
      });
    }

    return (
      <div className="portfolio-list-container">
        <h2>Portfolios</h2>
        
        <div className="portfolio-list panel panel-default">
          <table className="table table-sm table-hover">
            <thead className="thead-default">
              <tr>
                <th className="text-left" width="100%">Portfolio</th>
                <th className="text-right">Return</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {portfolios}
            </tbody>
          </table>        
        </div>

        <div className="bottom-spacer" />

        <div className="fab-container" >
          <a href="#" className="btn btn-primary btn-raised btn-fab" data-target="#addPortfolioModal" data-toggle="modal" id="addholding"><i className="material-icons">add</i></a>        
        </div>          
        
        {/* Modal add portfolio */} 
        <div className="modal fade" id="addPortfolioModal" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" ariaLabel="Close">
                  <span ariaHidden="true">&times;</span>
                </button>
                <h4 className="modal-title" id="addPortfolio">Add Portfolio</h4>
              </div>
              <div className="modal-body">
                  <div className="form-group row">
                    <div className="col-sm-12">
                      <input type="input" className="form-control" id="portfolioName" placeholder="Portfolio name..." autoComplete="off" autoFocus="true"/>
                    </div>
                  </div>
              </div>
              <div className="modal-footer bottom-align-text">
                <a className="btn btn-primary" data-dismiss="modal">Cancel</a>
                <a className="btn btn-primary" onClick={this.addPortfolio}>Add</a>
              </div>
            </div>
          </div>
        </div>


      </div>
    );
  }
});
