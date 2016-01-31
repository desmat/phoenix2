var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var PortfolioHolding = require('./PortfolioHolding.jsx');
var AddStockModal = require('./AddStockModal.jsx');
var RenamePortfolioModal = require('./RenamePortfolioModal.jsx');
var PortfolioHoldingDialog = require('./PortfolioHoldingDialog.jsx');

module.exports = React.createClass({

  previewTrade(ticker, quantity) {
    if (quantity > 0) {
      return this.previewBuyStock(ticker, quantity);
    }
    else if (quantity < 0) {
      return this.previewSellStock(ticker, Math.abs(quantity));
    }
    else {
      if (ticker) {
        var portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
        if (portfolioHolding) {
          delete portfolioHolding.sharesPreview;
          delete portfolioHolding.valuePreview;
        }
      }

      delete this.state.data.cashPreview;      
    }
  },

  previewBuyStock(ticker, quantity) {
    console.log('PortfolioDetails.previewBuyStock(' + ticker + ', ' + quantity + ')');
    var self = this;
    var portfolioHolding;

    if (typeof ticker == 'string') {
      portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
    } 

    if (portfolioHolding && quantity) {
      portfolioHolding.sharesPreview = parseInt(portfolioHolding.shares) + parseInt(quantity);
      portfolioHolding.valuePreview = App.formatNumber(parseFloat(portfolioHolding.value) + (parseInt(quantity) * portfolioHolding.price));
      this.state.data.cashPreview = App.formatNumber(parseFloat(this.state.data.cash) - parseFloat(quantity * portfolioHolding.price));

      this.setState({data: this.state.data});      
    }
  },

  previewSellStock(ticker, quantity) {
    console.log('PortfolioDetails.previewSellStock(' + ticker + ', ' + quantity + ')');
    var self = this;
    var portfolioHolding;

    if (typeof ticker == 'string') {
      portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
    } 

    if (portfolioHolding && quantity) {
      portfolioHolding.sharesPreview = parseInt(portfolioHolding.shares) - parseInt(quantity);
      if (!portfolioHolding.sharesPreview) portfolioHolding.sharesPreview = '0';
      portfolioHolding.valuePreview = App.formatNumber(parseFloat(portfolioHolding.value) - (parseInt(quantity) * portfolioHolding.price));
      this.state.data.cashPreview = App.formatNumber(parseFloat(this.state.data.cash) + parseFloat(quantity * portfolioHolding.price));

      this.setState({data: this.state.data});      
    }
  },

  buyStock(ticker, quantity) {
    // console.log('PortfolioDetails.buyStock(' + ticker + ', ' + quantity + ')');
    quantity = parseInt(quantity || 1);
    var self = this;
    var portfolioHolding;

    if (typeof ticker == 'string') {
      portfolioHolding = _.find(this.state.data.holdings, {ticker: ticker.toUpperCase()});
    } 
    else if (typeof this.state.selectedHoldingId !== 'undefined') {
      ticker = undefined;
      portfolioHolding = _.find(this.state.data.holdings, {id: this.state.selectedHoldingId});
    }

    //portfolio does not contain this holding
    if (!portfolioHolding) {
      portfolioHolding = {portfolioId: this.props.params.id, id:0, ticker:ticker, cost:0, dirty: true};
      this.state.data.holdings = this.state.data.holdings.concat(portfolioHolding);
    }

    portfolioHolding.shares = portfolioHolding.shares + quantity;
    portfolioHolding.value = App.formatNumber(parseFloat(portfolioHolding.value) + (parseInt(quantity) * portfolioHolding.price));
    delete portfolioHolding.sharesPreview;
    delete portfolioHolding.valuePreview;
    portfolioHolding.dirty = true;

    this.state.data.cash = App.formatNumber(parseFloat(this.state.data.cash) - parseFloat(quantity * portfolioHolding.price));
    delete this.state.data.cashPreview;
    this.state.data.dirty = true;

    this.setState({data: this.state.data});

    if (ticker) {
      Api.post('portfolio/' + this.state.data.id + '/ticker/' + ticker, {quantity: quantity}, function(data) { 
        //self.fetchData();
      });    
    }
  },

  sellStock(ticker, quantity) {
    // console.log('PortfolioDetails.sellStock(' + ticker + ', ' + quantity + ')');
    quantity = parseInt(quantity || 1);
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
      portfolioHolding.value = App.formatNumber(parseFloat(portfolioHolding.value) - (parseInt(quantity) * portfolioHolding.price));
      portfolioHolding.dirty = true;
      delete portfolioHolding.sharesPreview;
      delete portfolioHolding.valuePreview;
      delete this.state.data.cashPreview;

      if (portfolioHolding.shares <= 0) {
        this.state.data.holdings = _.difference(this.state.data.holdings, _.filter(this.state.data.holdings, {ticker:ticker}));
      }

      this.state.data.cash = App.formatNumber(parseFloat(this.state.data.cash) + parseFloat(quantity * portfolioHolding.price));
      delete this.state.data.cashPreview;
      this.state.data.dirty = true;

      this.setState({data: this.state.data});

      Api.post('portfolio/' + this.state.data.id + '/ticker/' + ticker, {quantity: -1 * quantity}, function(data) { 
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

  renamePortfolio(name) {
    // console.log('PortfolioDetails.confirmRenamePortfolio');

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
    // console.log('PortfolioDetails.selectHolding(' + id + ')');

    var portfolioHolding = _.find(this.state.data.holdings, {id: id});
    if (portfolioHolding) {
      this._openPortfolioHoldingDialog(portfolioHolding);
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

  _addStockModalOpened() {
    // console.log('PortfolioDetails._addStockModalOpened');
    this._setupPageKeyPressed(false);
  },

  _addStockModalClosed() {
    // console.log('PortfolioDetails._addStockModalClosed');
    this._setupPageKeyPressed(true); 

    //the ESC key will hide modals by defaut and so we better catch it here
    this.setState({addStockModalOpen: false}); 
  },

  _openAddStockModal() {
    // console.log('PortfolioDetails._openAddStockModal');
    this.setState({addStockModalOpen: true}); 
  },

  _closeAddStockModal(result) {
    // console.log('PortfolioDetails._closeAddStockModal');
    if (result && result.ticker && result.quantity && result.quantity > 0) {
      this.buyStock(result.ticker, result.quantity);          
    }

    this.setState({addStockModalOpen: false}); //redundant?
  },

  _renamePortfolioModalOpened() {
    // console.log('PortfolioDetails._renamePortfolioModalOpened');
    this._setupPageKeyPressed(false);
  },

  _renamePortfolioModalClosed() {
    // console.log('PortfolioDetails._renamePortfolioModalClosed');
    //the ESC key will hide modals by defaut and so we better catch it here
    if (this.state.renamePortfolioModalOpen) this.setState({renamePortfolioModalOpen: false});
    this._setupPageKeyPressed(true); 
  },

  _openRenamePortfolioModal() {
    // console.log('PortfolioDetails._openRenamePortfolioModal');
    this.setState({renamePortfolioModalOpen: true});
  },

  _closeRenamePortfolioModal(result) {
    // console.log('PortfolioDetails._closeRenamePortfolioModal');

    if (result && result.name) {
      this.renamePortfolio(result.name);
    }

    this.setState({renamePortfolioModalOpen: false}); //redundant?
  },

  _portfolioHoldingDialogClosed() {
    console.log('PortfolioDetails._portfolioHoldingDialogClosed');
  },

  _portfolioHoldingDialogOpened() {
    console.log('PortfolioDetails._portfolioHoldingDialogOpened');
  },

  _openPortfolioHoldingDialog(portfolioHolding) {
      this.setState({portfolioHoldingDialogOpen: true, selectedHolding: portfolioHolding});
  },

  _closePortfolioHoldingDialog(result) {
    if (result && result.ticker && result.quantity) {
      if (result.quantity > 0) {
        this.buyStock(result.ticker, result.quantity);
      }
      else if (result.quantity < 0) {
        this.sellStock(result.ticker, Math.abs(result.quantity));
      }
    }

    this.setState({portfolioHoldingDialogOpen: false});
  },

  _init() {
    console.log('PortfolioDetails._init');
    
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
    return {data: Api.getInitial(this.componentDataUrl), portfolioHoldingDialogOpen: false};
  },  

  componentWillMount() {
    // console.log('PortfolioDetails.componentWillMount');
  },

  componentDidMount() {
    // console.log('PortfolioDetails.componentDidMount');
// $('#addholding').click();
    this._init();
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
                <td className="text-center"><span className={this.state.data.cashPreview ? "text-preview" : this.state.data.dirty ? "text-muted" : ""}>${this.state.data.cashPreview ? this.state.data.cashPreview : this.state.data.cash}</span></td>
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
          <button onClick={this.deletePortfolio} className="btn btn-raised btn-default">Delete</button> <button onClick={this._openRenamePortfolioModal} className="btn btn-raised btn-default">Rename</button>
        </div>

        <div className="bottom-spacer" />

        <PortfolioHoldingDialog isOpen={this.state.portfolioHoldingDialogOpen} fabClicked={this._openAddStockModal} close={this._closePortfolioHoldingDialog} preview={this.previewTrade} selectedHoldingId={this.state.selectedHoldingId} portfolioHolding={this.state.selectedHolding} cash={this.state.data.cash} buyStock={this.buyStock} sellStock={this.sellStock} opened={this._portfolioHoldingDialogOpened} closed={this._portfolioHoldingDialogClosed}/>

        <AddStockModal isOpen={this.state.addStockModalOpen} close={this._closeAddStockModal} data={{cash: this.state.data.cash}} opened={this._addStockModalOpened} closed={this._addStockModalClosed} />

        <RenamePortfolioModal isOpen={this.state.renamePortfolioModalOpen} close={this._closeRenamePortfolioModal} data={{name: this.state.data.name}} opened={this._renamePortfolioModalOpened} closed={this._renamePortfolioModalClosed} />

      </div>
    );
  },

});
