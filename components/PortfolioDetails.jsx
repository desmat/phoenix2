var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');
var AddStockModal = require('./AddStockModal.jsx');
var RenamePortfolioModal = require('./RenamePortfolioModal.jsx');

module.exports = React.createClass({

  addStock() {
    console.log('PortfolioDetails.addStock');    

    var ticker = $('#searchTicker').typeahead('val');
    if (ticker) {
      ticker = ticker.split('-');
      if (ticker) {
        if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
    
        var quantity = document.getElementById('tradeSlider').noUiSlider.get();

        if (quantity > 0) {
          this.buyStock(ticker, quantity);
          $('#addHoldingModal').modal('hide');
        }
      }
    }
  },

  buyStock(ticker, quantity) {
    console.log('PortfolioDetails.buyStock(' + ticker + ', ' + quantity + ')');
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

  sellStock(ticker, quantity) {
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

  _setupPageKeyPressed(set){
    // console.log('PortfolioDetails._setupPageKeyPressed(' + set + ')');
    // var self = this;

    // if (set) {
    //   // console.log('activeElement'); console.dir(document.activeElement);
    //   document.activeElement.blur(); 
    //   // $('#addHolding').blur();
    //   $(document).on('keydown', function(e) {
    //     if (e.keyCode == 13) {
    //       $('#addHoldingModal').modal('show');
    //     }
    //     else if (e.keyCode == 27) {
    //       self._closeDialogPanel();
    //     }
    //   });
    // }
    // else {
    //   $(document).off('keypress');      
    // }
  },

  _addStockModalShown() {
    console.log('PortfolioDetails._addStockModalShown');
    this._setupPageKeyPressed(false);
  },

  _addStockModalHidden() {
    console.log('PortfolioDetails._addStockModalHidden');
    this._setupPageKeyPressed(true); 
  },

  _renamePortfolioModalShown() {
    console.log('PortfolioDetails._renamePortfolioModalShown');
    this._setupPageKeyPressed(false);
  },

  _renamePortfolioModalHidden() {
    console.log('PortfolioDetails._renamePortfolioModalHidden');
    this._setupPageKeyPressed(true); 
  },

  _initModals() {
    console.log('PortfolioDetails._initModals');
    
    // this._initRenamePortfolioModal();
    // this._initAddHoldingModal();
    this._setupPageKeyPressed(true);    
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
// $('#addholding').click();
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
        <PortfolioHolding key={holding.id} data={holding} selectHolding={self.selectHolding} buyStock={self.buyStock} sellStock={self.sellStock}/>
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
            <p><button className="btn btn-danger" onClick={this.sellStock}>Sell</button> <button className="btn btn-primary" onClick={this.buyStock}>Buy</button></p>
          </div>

          <div className={`fab-container-close ${this.state.dialogPanelOpened ? 'fab-container-close' : ''}`}  >
            <button href="#" className="btn btn-default btn-raised btn-fab" onClick={this._closeDialogPanel}><i className="material-icons">arrow_drop_down</i></button>
          </div>                    
        </div>

        <AddStockModal cash={this.state.data.cash} ok={this.addStock} shown={this._addStockModalShown} hidden={this._addStockModalHidden} />

        <RenamePortfolioModal ok={this.confirmRenamePortfolio} shown={this._renamePortfolioModalShown} hidden={this._renamePortfolioModalHidden} />

      </div>
    );
  },

});
