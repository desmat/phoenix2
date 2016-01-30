var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  _okClicked() {
    console.log('RenamePortfolioModal._okClicked');

    var name = $('#newPortfolioName').val();
    if (name && this.props.close) this.props.close({name: name});
    $('#renamePortfolioModal').modal('hide');      
  },

  _cancelClicked() {
    console.log('RenamePortfolioModal._cancelClicked');
    if (this.props.close) this.props.close();
  },

  _init() {
    console.log('RenamePortfolioModal._init');
    var self = this;

    $("#renamePortfolioModal").on('shown.bs.modal', function() {
      if (self.props.opened) self.props.opened();
      $('#newPortfolioName').focus();
      $('#newPortfolioName').select();
    });

    $("#renamePortfolioModal").on('hidden.bs.modal', function() { 
      if (self.props.closed) self.props.closed();
    });

    $("#newPortfolioName").on('keypress', function(e) { if (e.keyCode == 13) { self._okClicked() } });
  },

  componentDidMount() {
    // console.log('RenamePortfolioModal.componentDidMount');
    this._init();
  }, 

  componentWillReceiveProps(nextProps) {
    console.log('RenamePortfolioModal.componentWillReceiveProps');

    if (nextProps.isOpen && !this.props.isOpen && nextProps.data.name) {
      $('#newPortfolioName').val(nextProps.data.name);
      $('#renamePortfolioModal').modal('show'); 
      // if (nextProps.shown) nextProps.shown(); //dialog has its own lifecycle hooks above
    }
    else if (!nextProps.isOpen && this.props.isOpen) {
      $('#newPortfolioName').val('');
      $('#renamePortfolioModal').modal('hide');      
      // if (nextProps.closed) nextProps.closed(); //dialog has its own lifecycle hooks above    
    }
  },

  render() {    
    return(    
      <div className="modal fade" id="renamePortfolioModal" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" onClick={this._cancelClicked} ariaLabel="Close">
                <span ariaHidden="true">&times;</span>
              </button>
              <h4 className="modal-title" id="addPortfolio">Rename Portfolio</h4>
            </div>
            <div className="modal-body">
                <div className="form-group row">
                  <div className="col-sm-12">
                    <input type="input" className="form-control" id="newPortfolioName" placeholder="New portfolio name..." autoComplete="off" autoFocus="true" />
                  </div>
                </div>
            </div>
            <div className="modal-footer">
              <a className="btn btn-primary" onClick={this._cancelClicked}>Cancel</a>
              <a className="btn btn-primary" onClick={this._okClicked}>Apply</a>
            </div>
          </div>
        </div>
      </div>
    );
  },

});
