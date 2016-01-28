var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');

module.exports = React.createClass({

  addHolding() {
    // console.log('PortfolioDetails.addHolding');    
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

  deletePortfolio() {
    // console.log('deletePortfolio');

    Api.delete('portfolio', this.state.data.id);
    //maybe tweak the portfolios page here to make is smoother when we nagivate there?
    App.navigate('/');
  },

  renamePortfolio() {
    // console.log('renamePortfolio');

    $('#newPortfolioName').val(this.state.data.name);
    $('#renamePortfolioModal').modal('show');
  },

  confirmRenamePortfolio() {
    // console.log('confirmRenamePortfolio');

    var name = $('#newPortfolioName').val();
    var id = this.state.data.id;

    if (name && id) {
      console.log('rename portfolio [' + id + '] to [' + name + ']');

      this.state.data.name=name;
      this.setState({data: this.state.data});

      Api.put('portfolio', id, this.state.data);
    }

    $('#renamePortfolioModal').modal('hide');
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

  _initModals() {
    // console.log('PortfolioDetails._initAddHoldingModal');
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

    var setupPageKeyPressed = function(set){
      if (set) {
        document.activeElement.blur(); //strange: after navigating from the navbar document.onkeypress doesn't work
        $(document).on('keypress', function(e) {
          if (e.keyCode == 13) {
            $('#addHoldingModal').modal('show');
          }
        });
      }
      else {
        $(document).off('keypress');      
      }
    };

    //modal events: add holding

    $("#addHoldingModal").on('shown.bs.modal', function() { 
      $("#searchTicker").val('');
      $("#searchTicker").typeahead('val', '')     
      $("#searchTicker").typeahead("close");
      $("#searchTicker").focus(); 
      setupPageKeyPressed(false); 
    });

    $("#addHoldingModal").on('hidden.bs.modal', function() { 
      $("#searchTicker").val('');
      $("#searchTicker").typeahead('val', '')     
      $("#searchTicker").typeahead("close");
      setupPageKeyPressed(true); 
    });   

    $("#searchTicker").on('keypress', function(e) { if (e.keyCode == 13) { self.addHolding(); } });

    //modal events: rename portfolio
    
    $("#renamePortfolioModal").on('shown.bs.modal', function() {
      setupPageKeyPressed(false);
      $('#newPortfolioName').focus();
      $('#newPortfolioName').select();
    });

    $("#renamePortfolioModal").on('hidden.bs.modal', function() { 
      setupPageKeyPressed(true); 
    });

    $("#newPortfolioName").on('keypress', function(e) { if (e.keyCode == 13) { self.confirmRenamePortfolio(); } })

    //finally init page-wide events

    setupPageKeyPressed(true);    
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

  componentDidMount() {
    // console.log('PortfolioDetails.componentDidMount');

    this._initModals();
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
        <h3></h3>

        <div className="portfolio-details panel panel-default">  
          <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="thead-default">
              <tr>
                <th className="text-center" width="50%">Cash</th>
                <th className="text-center" width="50%">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center"><span className={this.state.data.dirty ? "text-muted" : ""}>${this.state.data.cash}</span></td>
                <td className="text-center"><span className={this.state.data.dirty ? "text-muted" : ""}>${this.state.data.value} (<span className={this.state.data.returnPercent >= 0 ? "text-success" : this.state.data.returnPercent < 0 ? "text-danger" : ""}>{this.state.data.returnPercentFormatted}</span>)</span></td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="portfolio-holdings panel panel-default">  
          <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="thead-default">
              <tr>
                <th colSpan="2" className="text-left">Holdings</th>
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
          </div>
        </div>

        <div className="actions-container text-center">
          <button onClick={this.deletePortfolio} className="btn btn-raised btn-default">Delete</button>
          <button onClick={this.renamePortfolio} className="btn btn-raised btn-default">Rename</button>
        </div>

        <div className="bottom-spacer" />

        <div className="fab-container" >
          <a href="#" className="btn btn-primary btn-raised btn-fab" data-target="#addHoldingModal" data-toggle="modal" id="addholding"><i className="material-icons">add</i></a>        
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
                <a className="btn btn-primary" data-dismiss="modal">Cancel</a>
                <a className="btn btn-primary" onClick={this.addHolding}>Add</a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal edit portfolio */}
        <div className="modal fade" id="renamePortfolioModal" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" ariaLabel="Close">
                  <span ariaHidden="true">&times;</span>
                </button>
                <h4 className="modal-title" id="addPortfolio">Rename Portfolio</h4>
              </div>
              <div className="modal-body">
                  <div className="form-group row">
                    <div className="col-sm-12">
                      <input type="input" className="form-control" id="newPortfolioName" placeholder="New portfolio name..." autoComplete="off" autoFocus="true"/>
                    </div>
                  </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-primary" data-dismiss="modal">Cancel</a>
                <a className="btn btn-primary" onClick={this.confirmRenamePortfolio}>Apply</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  },

});
