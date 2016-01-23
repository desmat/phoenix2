var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');
var Ticker = require('./Ticker.jsx');

module.exports = React.createClass({

  addTicker() {
    var self = this;
    //console.log('Tickers.addTicker'); 

    var ticker = $('#searchTicker').val();
    if (ticker) {
      ticker = ticker.split('-');
      if (ticker) {
        if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
        ticker = ticker.toUpperCase();
        
        var newTicker = {id: 0, ticker: ticker};
        this.setState({data: this.state.data.concat(newTicker)}); 

        $('#addTickerModal').modal('hide');
        
        Api.post('ticker', newTicker, function(data) { 
          // console.dir(data);
          //update new portfolio's id
          _.find(self.state.data, {ticker: data.ticker}).id=data.id;
          self.setState({data: self.state.data});

          //socketio will update the rest of the record
        });        
      }
    }
  },

  deleteTicker(id) {
    //console.log('Tickers.deleteTicker(' + id + ')');    

    var tickers = _.difference(this.state.data, _.filter(this.state.data, {id: id}));
    this.setState({data: tickers});

    Api.delete('ticker', id);
  },

  fetchData() {
    //console.log('Tickers.fetchData'); 
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
    //console.log('Tickers.socketIo'); console.dir(msg);
    this.fetchData();
  },

  getInitialState() {
    //console.log('Tickers.getInitialState');
    this.componentName = 'Tickers';
    this.socketIoModel = 'ticker';
    this.componentDataUrl = 'ticker/details'
    return {data: Api.getInitial(this.componentDataUrl)};
  },  

  componentWillMount() {
    // console.log('Tickers.componentWillMount');
  },

  _initAddTickerModal() {
    // console.log('Tickers._initAddTickerModal');
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
      $("#searchTicker").focus(); //TODO why the hell does brings back last value...
      $("#searchTicker").typeahead("close");
    };

    $("#addTickerModal").on('shown.bs.modal', resetModal);
    $("#addTickerModal").on('hidden.bs.modal', resetModal);
    $("#searchTicker").on('keypress', function(e) { if (e.keyCode == 13) { self.addTicker(); } });
  },

  componentDidMount() {
    //console.log('Tickers.componentDidMount');

    $(document).on('keypress', function(e) {
      if (e.keyCode == 13 && !$("#addTickerModal").is(':visible')) {
        $('#addTickerModal').modal('show');
      }
    });

    this._initAddTickerModal();
    //TODO: figure out why this won't kick in when loading this component from back-end
    App.registerSocketIo(this.componentName, this.socketIoModel, this.socketIo);
    this.fetchData();
  }, 

  componentDidUpdate() {
    // console.log('Tickers.componentDidUpdate');
    App.init();
  },

  componentWillUnmount() {
    // console.log('Tickers.componentWillUnmount');
    App.registerSocketIo(this.componentName, this.socketIoModel);
    $(document).off('keypress');
  },

  render: function() {    
    var self = this;

    var tickers = _.sortBy(this.state.data, 'ticker').map(function(ticker) {
      return (  
        <Ticker key={ticker.id} data={ticker} delete={self.deleteTicker}/>
      );
    });

    return(
      <div className="tickers">
        <h2>Tickers</h2>
        <h3></h3>

        <table className="table table-sm table-hover">
          <thead className="thead-default">
            <tr>
              <th className="text-right">Symbol</th>
              <th className="text-left" width="100%">Name</th>
              <th colSpan="2" className="text-center">Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickers}
          </tbody>
        </table>

        <br/>
        <div className="text-center">
          <a className="btn btn-primary" id="addholding" data-toggle="modal" data-target="#addTickerModal">
            <i className="fa fa-plus" aria-hidden="true"/> Add Ticker
          </a>
        </div>

        {/* Modal add ticker */}
        <div className="modal fade" id="addTickerModal" tabIndex="-1" role="dialog" ariaLabelledby="myModalLabel" ariaHidden="true">
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
                <a className="btn btn-primary" onClick={this.addTicker}><i className="fa fa-plus" ariaHidden="true"/> Add</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

});
