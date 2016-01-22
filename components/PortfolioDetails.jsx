var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');

module.exports = React.createClass({

  addHolding() {

    //var ticker = window.prompt("Ticker", $('#searchTicker').val());
    var ticker = $('#searchTicker').val();
    if (ticker) {
      ticker = ticker.split('-');
      if (ticker) {
        if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
    
        this.buyHolding(ticker);
        $('#addHoldingModal').modal('hide');
      }
    }
  },

  buyHolding(ticker) {
    //console.log('PortfolioDetails.buyHolding(' + ticker + ')');
    ticker = ticker.toUpperCase();
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares + 1;
      portfolioHolding.dirty = true;
      this.state.data.dirty = true;
      this.setState({data: this.state.data});
    }
    //portfolio does not contain this holding
    else {
      portfolioHolding = {portfolioId: this.props.params.id, id:0, ticker:ticker, shares:1, cost:0, dirty: true};
      this.state.data.holdings = this.state.data.holdings.concat(portfolioHolding);
      this.state.data.dirty = true;
      this.setState({data: this.state.data}); //id will be updated later
    }

    Api.post('portfolio/' + this.state.data.id + '/ticker/' + ticker, {}, function(data) { 
      //self.fetchData();
    });    
  },

  sellHolding(ticker) {
    var self = this;
    var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker});
    //portfolio already contains this holding
    if (portfolioHolding) {
      portfolioHolding.shares = portfolioHolding.shares - 1;      
      portfolioHolding.dirty = true;

      if (portfolioHolding.shares <= 0) {
        this.state.data.holdings = _.difference(this.state.data.holdings, _.filter(this.state.data.holdings, {ticker:ticker}));
        this.state.data.dirty = true;
        this.setState({data: this.state.data});
      }
      else {
        this.state.data.dirty = true;
        this.setState({data: this.state.data});
      }

      Api.delete('portfolio/' + this.state.data.id + '/ticker/' + ticker, null, function(data) { 
        //self.fetchData();
      }); 
    }
    //portfolio does not contain this holding
    else {
      console.log("Dude wtf");
    }
  },

  _clearUpdatedFlags(holdingId) {
    var h = _.find(this.state.data.holdings, {id: holdingId});
    if (h) {
      delete h.updatedUp; 
      delete h.updatedDown; 
      delete h.flashTimeout;
      this.setState({data: this.state.data});
    }
  },

  fetchData() {
    // console.log('PortfolioDetails.fetchData'); 
    var self = this;

    Api.get(this.componentDataUrl, function(data) { 
      
      //setup flash flags
      _.each(data.holdings, function(h) {
        var c = _.find(self.state.data.holdings, {id: h.id});
        if (c) {
          if (c.price != h.price) {
            console.log('setting updated');
            h.updatedUp = h.price > c.price;
            h.updatedDown = !h.updatedUp;
          }
          else {
            h.updatedUp = c.updatedUp;
            h.updatedDown = c.updatedDown
          }

          //take out those flash attribute after a second so that they don't interfere with the next update  
          setTimeout(self._clearUpdatedFlags(h.id), 1000, h.id);
        }
      });

      self.setState({data: data}); 

    }, function(errorCode) {
      if (errorCode == 403) {
        App.logout();
        App.navigate('/login');
      }
    });
  },

  socketIo(msg) {
    //console.log('PortfolioDetails.socketIo'); console.dir(msg);
    if (msg.id == this.props.params.id) {
      this.fetchData();
    }
  },

  getInitialState() {
    // console.log('PortfolioDetails.getInitialState');
    this.componentName = 'PortfolioDetails';
    this.socketIoModel = 'portfolio';
    this.componentDataUrl = 'portfolio/' + this.props.params.id;
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentWillMount() {
    // console.log('PortfolioDetails.componentWillMount');
  },

  _initAddHoldingModal() {
    var self = this;

    var findMatches = function(q, cb, async) {
      var where = 'where={"or":[{"ticker":{"contains":"' + q + '"}},{"name":{"contains":"' + q + '"}}]}';
      var url = 'ticker?' + where + '&sort=name%2asc';

      Api.get(url, function(data) {
        var matches = 
          _.sortBy(
            _.map(data, function(ticker) { return ticker.ticker + ' - ' + ticker.name; }), 
            function(n) { return (1 - (n.toLowerCase().split(q.toLowerCase()).length/1000)).toFixed(4) + '-' + n });

        async(matches);
      });
    };

    $('#searchTicker').typeahead({
      hint: false,
      highlight: true,
      minLength: 2, 
      async: true,
    },
    {
      name: 'stocks',
      source: findMatches
    });  

    var resetModal = function () {
      $("#searchTicker").val('');
      $("#searchTicker").focus();
      $("#searchTicker").typeahead("close");
    };

    $("#addHoldingModal").on('shown.bs.modal', resetModal);
    $("#addHoldingModal").on('hidden.bs.modal', resetModal);
    $("#searchTicker").on('keypress', function(e) { if (e.keyCode == 13) { self.addHolding(); } })
  },

  componentDidMount() {
    // console.log('PortfolioDetails.componentDidMount');
    this._initAddHoldingModal();

    $(document).on('keypress', function(e) {
      if (e.keyCode == 13 && !$("#addHoldingModal").is(':visible')) {
        $('#addholding').click();
      }
    });

    //TODO: figure out why this won't kick in when loading this component from back-end
    App.registerSocketIo(this.componentName, this.socketIoModel, this.socketIo);
    this.fetchData();
  }, 

  componentDidUpdate() {
    // console.log('PortfolioDetails.componentDidUpdate');
    App.init();
  },

  componentWillUnmount() {
    // console.log('PortfolioDetails.componentWillUnmount');
    App.registerSocketIo(this.componentName, this.socketIoModel);
    $(document).off('keypress');
  },

  render: function() {    
    var self = this;

    var holdings = _.sortBy(this.state.data.holdings, 'ticker').map(function(holding) {
      return (  
        <PortfolioHolding key={holding.id} data={holding}  buyHolding={self.buyHolding} sellHolding={self.sellHolding}/>
      );
    });

    return(
      <div className="portfolio-details" onKeyDown={this.bodyKeyDown}>
        <h2>Portfolio: {this.state.data.name}</h2>
        <h3>Value: <span className={this.state.data.dirty ? "text-muted" : ""}>${this.state.data.value} (<span className={this.state.data.returnPercent >= 0 ? "text-success" : this.state.data.returnPercent < 0 ? "text-danger" : ""}>{this.state.data.returnPercentFormatted}</span>)</span></h3>
        <h3>Cash: <span className={this.state.data.dirty ? "text-muted" : ""}>${this.state.data.cash}</span></h3>
        <h3></h3>

        <table className="table table-sm table-hover portfolio-holdings">
          <thead className="thead-default">
            <tr>
              <th colSpan="2" className="text-left"></th>
              <th className="text-center">Qty</th>
              <th colSpan="2" className="text-center">Price</th>
              <th colSpan="2" className="text-center">Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings}
          </tbody>
        </table>

        <br/>
        <div className="text-center">
          <Link to="/" className="btn btn-default"><i className="fa fa-backward" aria-hidden="true"/> Back</Link> 
          &nbsp;<a className="btn btn-primary" id="addholding" data-toggle="modal" data-target="#addHoldingModal">
            <i className="fa fa-plus" aria-hidden="true"/> Add Stock
          </a>
        </div>

        {/* Modal add ticker */}
        <div className="modal fade" id="addHoldingModal" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" ariaLabel="Close">
                  <span ariaHidden="true">&times;</span>
                </button>
                <h4 className="modal-title" id="myModalLabel">Add Stock</h4>
              </div>
              <div className="modal-body">
                  <div className="form-group row">
                    <div className="col-sm-12">
                      <input type="input" className="form-control" id="searchTicker" placeholder="Search stock by symbol or name..." autoComplete="off" autoFocus="true"/>
                    </div>
                  </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-default" data-dismiss="modal"><i className="fa fa-backward" aria-hidden="true"/> Cancel</a>
                <a className="btn btn-primary" onClick={this.addHolding}><i className="fa fa-plus" ariaHidden="true"/> Add</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

});
