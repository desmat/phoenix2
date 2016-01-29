var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');

module.exports = React.createClass({

  addHolding() {
    console.log('PortfolioDetails.addHolding');    
    if (!$('#addHoldingModalAdd').prop('disabled')) {
      var ticker = $('#searchTicker').typeahead('val');
      if (ticker) {
        ticker = ticker.split('-');
        if (ticker) {
          if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
      
          var quantity = document.getElementById('tradeSlider').noUiSlider.get();

          this.buyHolding(ticker, quantity);
          $('#addHoldingModal').modal('hide');
        }
      }
    }
  },

  buyHolding(ticker, quantity) {
    console.log('PortfolioDetails.buyHolding(' + ticker + ', ' + quantity + ')');
    quantity = quantity || 1;
    var self = this;
    var portfolioHolding;

    if (typeof ticker == 'string') {
      portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
    } 
    else if (typeof this.state.selectedHoldingId !== 'undefined') {
      ticker = undefined;
      portfolioHolding = _.find(this.state.data.holdings, {id: this.state.selectedHoldingId});
    }

    //portfolio already contains this holding
    if (portfolioHolding) {
      ticker = portfolioHolding.ticker;
      portfolioHolding.shares = portfolioHolding.shares + quantity;
      portfolioHolding.dirty = true;
      this.state.data.dirty = true;
      this.setState({data: this.state.data});
    }
    //portfolio does not contain this holding
    else {
      portfolioHolding = {portfolioId: this.props.params.id, id:0, ticker:ticker, shares:quantity, cost:0, dirty: true};
      this.state.data.holdings = this.state.data.holdings.concat(portfolioHolding);
      this.state.data.dirty = true;
      this.setState({data: this.state.data}); //id will be updated later
    }

    if (ticker) {
      Api.post('portfolio/' + this.state.data.id + '/ticker/' + ticker, {quantity: quantity}, function(data) { 
        //self.fetchData();
      });    
    }
  },

  sellHolding(ticker, quantity) {
    quantity = quantity || 1;
    var self = this;
    var portfolioHolding;

    if (typeof ticker == 'string') {
      portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
    } 
    else if (typeof this.state.selectedHoldingId !== 'undefined') {
      ticker = undefined;
      portfolioHolding = _.find(this.state.data.holdings, {id: this.state.selectedHoldingId});
    }

    //portfolio already contains this holding
    if (portfolioHolding) {
      ticker = portfolioHolding.ticker;
      portfolioHolding.shares = portfolioHolding.shares - quantity;      
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

      Api.delete('portfolio/' + this.state.data.id + '/ticker/' + ticker, {quantity: quantity}, function(data) { 
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

    //TODO maybe tweak the portfolios page here to make is smoother when we nagivate there?
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

  selectHolding(id) {
    console.log('PortfolioDetails.selectHolding(' + id + ')');
    var self = this;

    // if (this.state.dialogPanelOpened) {
    //   this._closeDialogPanel();
    // }
    // else {
      //TODO set panel content
      var portfolioHolding = _.find(this.state.data.holdings, {id: id});
      $('.dialog-content').html('Details for ' + portfolioHolding.ticker + ' holding');
      this.setState({dialogPanelOpened: true, selectedHoldingId: id});
    // }
  },

  _closeDialogPanel() {
    if (this.state.dialogPanelOpened) {
      //TODO blank out panel
      this.setState({dialogPanelOpened: false, selectedHoldingId: undefined});
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
        $(document).on('keydown', function(e) {
          if (e.keyCode == 13) {
            $('#addHoldingModal').modal('show');
          }
          else if (e.keyCode == 27) {
            self._closeDialogPanel();
          }
        });
      }
      else {
        $(document).off('keypress');      
      }
    };

    //modal events: add holding











    //setup the slider

    var setupTradeSlider = function(ticker) {
      console.log('setupTradeSlider: ' + ticker);
      var start = 0;
      var min = 0;
      var max = 1;
      var step = 1;
      var disabled = true;

      if (typeof ticker === 'string') {
        //search ticker, setup with it
        Api.get('ticker/' + ticker, function(data) {
          if (data) {
            if (_.isArray(data)) data = data[0];
            return setupTradeSlider(data);
          }
        })
      }
      else if (typeof ticker === 'object') {
        //setup with ticker's price and shit
        console.log('cash: ' + self.state.data.cash);
        console.log('price: ' + ticker.price);
        max = parseInt(Math.floor(self.state.data.cash / ticker.price));
        disabled = false;
      }

      var slider = document.getElementById('tradeSlider');
      var sliderIndicator = $('#tradeSliderIndicator');

      if (slider.noUiSlider && slider.noUiSlider.destroy) slider.noUiSlider.destroy(slider);

      noUiSlider.create(slider, {
        start: 0,
        // connect: true,
        step: 1,
        range: {
          'min': min,
          'max': max
        }
      }); 

      slider.noUiSlider.on('update', function(){
        var count = slider.noUiSlider.get();
        var quantity = 0; //TODO current holding quantity
        if (count > quantity) {
          sliderIndicator.html('Trade shares (+' + parseInt(count - quantity) + ')');
          $('#addHoldingModalAdd').prop('disabled', false);
        }
        else if (count < quantity) {
          sliderIndicator.html('Trade shares (' + parseInt(count - quantity) + ')');
          $('#addHoldingModalAdd').prop('disabled', false);
        }
        else {
          sliderIndicator.html('Trade shares');
          $('#addHoldingModalAdd').prop('disabled', true);
        }
      });

      if (disabled) {
        slider.setAttribute('disabled', disabled) 
      }
      else {
        slider.removeAttribute('disabled');
      }             
    };

    setupTradeSlider();

    var getTickerFromInput = function() {
      var ticker = $('#searchTicker').typeahead('val');
      if (ticker) {
        ticker = ticker.split('-');
        if (ticker) {
          if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
        }
      }

      return ticker;
    };

    $("#searchTicker").typeahead().on('typeahead:selected', function(e, datum) {
      //console.log('selected: ' + getTickerFromInput());
      // GRRRR f'in flaky shit! http://stackoverflow.com/questions/16974783/typeahead-js-on-blur-event
      $('#searchTicker').typeahead('val', $('#searchTicker').val());
      setupTradeSlider(getTickerFromInput());
    });











    $("#addHoldingModal").on('shown.bs.modal', function() { 
      $("#searchTicker").typeahead('val', '')     
      $("#searchTicker").typeahead("close");
      $("#searchTicker").focus(); 
      setupPageKeyPressed(false); 
      setupTradeSlider();
    });

    $("#addHoldingModal").on('hidden.bs.modal', function() { 
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
    return {data: Api.getInitial(this.componentDataUrl), dialogPanelOpened: false};
  },  

  componentWillMount() {
    // console.log('PortfolioDetails.componentWillMount');
  },

  componentDidMount() {
    // console.log('PortfolioDetails.componentDidMount');

    this._initModals();
    App.registerSocketIo(this.componentName, this.socketIoModel, this.socketIo);
    this.fetchData();



$('#addholding').click();

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
        <PortfolioHolding key={holding.id} data={holding} selectHolding={self.selectHolding} buyHolding={self.buyHolding} sellHolding={self.sellHolding}/>
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

        <div className={`fab-container ${this.state.dialogPanelOpened ? 'fab-container-opened' : ''}`}>
          <button className="btn btn-primary btn-raised btn-fab" data-target="#addHoldingModal" data-toggle="modal" id="addholding"><i className="material-icons">{this.state.dialogPanelOpened ? 'shopping_cart' : 'add'}</i></button>
        </div>          

        <div className={`well dialog-panel ${this.state.dialogPanelOpened ? 'dialog-panel-opened' : ''}`}>
          <p className="text-center"></p>
          <p className="text-center dialog-content">TODO put things here</p>
          <div className="text-center">
            <p><button className="btn btn-danger" onClick={this.sellHolding}>Sell</button> <button className="btn btn-primary" onClick={this.buyHolding}>Buy</button></p>
          </div>

          <div className={`fab-container-close ${this.state.dialogPanelOpened ? 'fab-container-close' : ''}`}  >
            <button href="#" className="btn btn-default btn-raised btn-fab" onClick={this._closeDialogPanel}><i className="material-icons">arrow_drop_down</i></button>
          </div>                    
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
                    <div className="col-sm-12">
                      <div id="tradeSliderIndicator">Trade shares</div>
                      <div id="tradeSlider" className="slider shor slider-primary"></div>
                    </div>
                  </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" data-dismiss="modal">Cancel</button>
                <button className="btn btn-primary" id="addHoldingModalAdd" disabled="disabled" onClick={this.addHolding}>Add</button>
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
