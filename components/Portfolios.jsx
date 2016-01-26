var React = require("react");
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var Portfolio = require('./Portfolio.jsx');

var RaisedButton = require('material-ui/lib/raised-button');
var Dialog = require('material-ui/lib/dialog');
var ThemeManager = require('material-ui/lib/styles/theme-manager');
var LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
var Colors = require('material-ui/lib/styles/colors');
var FlatButton = require('material-ui/lib/flat-button');
var TextField = require('material-ui/lib/text-field');

module.exports = React.createClass({

  addPortfolio() {
    console.log('addPortfolio');
    var self = this;
    var name = $('#portfolioName').val();
    if (name) {
      var newPortfolio = {id: 0, name: name, cash: 10000, value: 10000, returnPercent: 0, returnPercentFormatted: '+0.00'}; //id will be updated later
      this.setState({data: this.state.data.concat(newPortfolio), addPortfolioDialogOpen: false}); 
      
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

  renamePortfolio(id) {
    console.dir(id);
    var portfolio = _.find(this.state.data, {id: id});
    if (portfolio) {
      console.dir(portfolio);

      // $('#newPortfolioName').val(portfolio.name);
      // $('#newPortfolioNameId').val(id);

      //$('#renamePortfolioModal').modal('show');
      this._openRenamePortfolioDialog();
    }
  },

  confirmRenamePortfolio() {
    var self = this;
    var name = $('#newPortfolioName').val();
    var id = $('#newPortfolioNameId').val();

    if (name && id) {
      console.log('rename portfolio [' + id + '] to [' + name + ']');

      var portfolio = _.find(this.state.data, {id: parseInt(id)});
      console.dir(portfolio);
      if (portfolio) {
        portfolio.name=name;
        this.setState({data: this.state.data});

        Api.put('portfolio', id, portfolio);
      }      
    }

    $('#renamePortfolioModal').modal('hide');
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

  _initModals() {
    var self = this;

    var resetModal = function () {
      $("#portfolioName").val('');
      $("#portfolioName").focus();
    };

    $("#addPortfolioModal").on('shown.bs.modal', resetModal);
    $("#addPortfolioModal").on('hidden.bs.modal', resetModal);
    $("#portfolioName").on('keypress', function(e) { if (e.keyCode == 13) { self.addPortfolio(); } })

    $("#renamePortfolioModal").on('shown.bs.modal', function() {
      console.log('renamePortfolioModal shown.bs.modal');
      self._setupPageKeyPressed(false);
      $('#newPortfolioName').focus();
      $('#newPortfolioName').select();
    });

    $("#renamePortfolioModal").on('hidden.bs.modal', function() {
      self._setupPageKeyPressed(true);
      $('#newPortfolioName').val('');
    });

    $("#newPortfolioName").on('keypress', function(e) { if (e.keyCode == 13) { self.confirmRenamePortfolio(); } })
  },

  getInitialState() {
    this.componentName = 'Portfolio';
    this.componentDataUrl = 'portfolio';
    
    return {
      data: Api.getInitial(this.componentDataUrl), 
      addPortfolioDialogOpen: false, 
      renamePortfolioDialogOpen: false,
    };
  },  

  componentWillMount() {
    //console.log('Portfolio.componentWillMount');
  }, 

  _setupPageKeyPressed(set){
    if (set) {
      document.activeElement.blur(); //strange: after navigating from the navbar document.onkeypress doesn't work
      $(document).on('keypress', function(e) {
        if (e.keyCode == 13 && !$("#addPortfolioModal").is(':visible')) {
          $('#addPortfolioModal').modal('show');
        }
      });
    }
    else {
      $(document).off('keypress');      
    }
  },

  componentDidMount() {
    var self = this;
    // console.log('Portfolio.componentDidMount');

    this._setupPageKeyPressed(true);
    this._initModals();
    App.registerSocketIo(this.componentName, this.componentDataUrl, this.socketIo);
    this.fetchData();
  },  

  componentDidUpdate() {
    //console.log('Portfolio.componentDidUpdate');
    App.init();
  },

  componentWillUnmount() {
    //console.log('Portfolio.componentWillUnmount');
    this._setupPageKeyPressed();
    App.registerSocketIo(this.componentName, this.componentDataUrl);
  },




  _openAddPortfolioDialog() {
    this.setState({addPortfolioDialogOpen: true});
  },

  _closeAddPortfolioDialog() {
    this.setState({addPortfolioDialogOpen: false});
  },

  _openRenamePortfolioDialog() {
    this.setState({renamePortfolioDialogOpen: true});
  },

  _closeRenamePortfolioDialog() {
    this.setState({renamePortfolioDialogOpen: false});
  },

  _TextFieldChanged(e) {
    console.dir(e);
  },

  render() {
    var self = this;    
    var portfolios = [];

    if (this.state.data) {
      var portfolios = _.sortBy(this.state.data, function(n) { return n.name.toLowerCase(); }).map(function(portfolio) {
        return (
          <Portfolio key={portfolio.id} id={portfolio.id} data={portfolio} deletePortfolio={self.deletePortfolio} renamePortfolio={self.renamePortfolio} viewPortfolio={self.viewPortfolio} />
        );
      });
    }

    var addPortfolioDialogActions = (
      <div>
        <FlatButton
          label="Cancel"
          secondary={false}
          onTouchTap={this._closeAddPortfolioDialog}
        />
        <FlatButton
          label="Add"
          secondary={true}
          onTouchTap={this.addPortfolio}
        />
      </div>
    );

    var renamePortfolioDialogActions = (
      <div>
        <FlatButton
          label="Cancel"
          secondary={false}
          onTouchTap={this._closeRenamePortfolioDialog}
        />
        <FlatButton
          label="Add"
          secondary={true}
          onTouchTap={this.confirmRenamePortfolio}
        />
      </div>
    );

    return (
      <div className="portfolio-list-container">
        <h2>Portfolios</h2>
        <div className="portfolio-list">

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
          
          <br/>
          <div className="text-center">
            <RaisedButton label="New Portfolio" data-target="#addPortfolioModal" primary={true} onTouchTap={this._openAddPortfolioDialog}/>
          </div>
        </div>

        <Dialog
          open={this.state.addPortfolioDialogOpen}
          title="Add Portfolio"
          actions={addPortfolioDialogActions}
          onRequestClose={this._closeAddPortfolioDialog}
        >
          <TextField type="input" fullWidth="true" className="Xform-control" id="portfolioName" placeholder="New portfolio name..." autoComplete="off" autoFocus="true"/>
        </Dialog>  
        
        {/*
        <Dialog
          open={this.state.renamePortfolioDialogOpen}
          title="Rename Portfolio"
          actions={renamePortfolioDialogActions}
          onRequestClose={this._closeRenamePortfolioDialog}
        >
          <TextField type="input" className="form-control" id="newPortfolioName" placeholder="New portfolio name..." autoComplete="off" autoFocus="true"/>
          <TextField type="input" onChange={this._inputChanged} className="form-control" id="newPortfolioNameId" value={this.renamePortfolioDialogOpen}/>
        </Dialog>  
        */}

        {/* Modal add portfolio 
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
              <div className="modal-footer">
                <a className="btn btn-default" data-dismiss="modal"><i className="fa fa-backward" aria-hidden="true"/> Cancel</a>
                <a className="btn btn-primary" onClick={this.addHolding}><i className="fa fa-plus" ariaHidden="true"/> Add</a>
              </div>
            </div>
          </div>
        </div>
        */}

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
                      <input type="hidden" className="form-control" id="newPortfolioNameId" />
                    </div>
                  </div>
              </div>
              <div className="modal-footer">
                <a className="btn btn-default" data-dismiss="modal"><i className="fa fa-backward" aria-hidden="true"/> Cancel</a>
                <a className="btn btn-success" onClick={this.addHolding}><i className="fa fa-check" ariaHidden="true"/> Apply</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
