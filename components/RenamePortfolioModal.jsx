var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  _initModal() {
    console.log('RenamePortfolioModal._initModal');
    var self = this;

    $("#renamePortfolioModal").on('shown.bs.modal', function() {
      self.props.shown();
      $('#newPortfolioName').focus();
      $('#newPortfolioName').select();
    });

    $("#renamePortfolioModal").on('hidden.bs.modal', function() { 
      self.props.hidden();
    });

    $("#newPortfolioName").on('keypress', function(e) { if (e.keyCode == 13) { self.props.ok(); } });
  },

  componentDidMount() {
    // console.log('RenamePortfolioModal.componentDidMount');
    this._initModal();
  }, 
  
  render: function() {    
    return(    
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
                    <input type="input" className="form-control" id="newPortfolioName" placeholder="New portfolio name..." autoComplete="off" autoFocus="true" />
                  </div>
                </div>
            </div>
            <div className="modal-footer">
              <a className="btn btn-primary" data-dismiss="modal">Cancel</a>
              <a className="btn btn-primary" onClick={this.props.ok}>Apply</a>
            </div>
          </div>
        </div>
      </div>
    );
  },

});
