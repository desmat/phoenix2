var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  _okClicked() {
    // console.log('AddStockModal._okClicked');

    var ticker = $('#searchTicker').typeahead('val');
    if (ticker) {
      ticker = ticker.split('-');
      if (ticker) {
        if (_.isArray(ticker) && ticker.length > 0) ticker = ticker[0];
    
        var quantity = document.getElementById('tradeSlider').noUiSlider.get();

        if (quantity > 0 && this.props.close) {
          this.props.close({ticker: ticker, quantity: quantity});
        }
      }
    }

    //TODO error handling and shit
  },

  _cancelClicked() {
    // console.log('AddStockModal._cancelClicked');
    if (this.props.close) this.props.close();
  },

  _initTradeSlider(ticker) {
    // console.log('AddStockModal._initTradeSlider: ' + ticker);
    var self = this;
    var start = 0;
    var min = 0;
    var max = 1;
    var step = 1;
    var disabled = true;
    var symbol;

    if (typeof ticker === 'string') {
      //search ticker, setup with it
      Api.get('ticker/' + ticker, function(data) {
        if (data) {
          if (_.isArray(data)) data = data[0];
          return self._initTradeSlider(data);
        }
      })
    }
    else if (typeof ticker === 'object') {
      //setup with ticker's price and shit
      console.log('cash: ' + self.props.data.cash);
      console.log('price: ' + ticker.price);
      max = parseInt(Math.floor(self.props.data.cash / ticker.price));
      disabled = false;
      symbol = ticker.ticker;
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
        if (symbol && self.props.preview) self.props.preview(symbol, count - quantity);
        $('#addHoldingModalAdd').prop('disabled', false);
      }
      else if (count < quantity) {
        sliderIndicator.html('Trade shares (' + parseInt(count - quantity) + ')');
        if (symbol && self.props.preview) self.props.preview(symbol, quantity - count);
        $('#addHoldingModalAdd').prop('disabled', false);
      }
      else {
        sliderIndicator.html('Trade shares');
        if (symbol && self.props.preview) self.props.preview(symbol);
        $('#addHoldingModalAdd').prop('disabled', true);
      }
    });

    if (disabled) {
      slider.setAttribute('disabled', disabled) 
    }
    else {
      slider.removeAttribute('disabled');
    }             
  },

  _initSearchTicker() {
    // console.log('AddStockModal._initSearchTicker');
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
      self._initTradeSlider(getTickerFromInput());
    });

    $("#searchTicker").on('keypress', function(e) { if (e.keyCode == 13) { self.props.ok(); } });    
  },

  _init() {
    // console.log('AddStockModal._init');
    var self = this;

    this._initSearchTicker();

    this._initTradeSlider();

    $("#addHoldingModal").on('shown.bs.modal', function() { 
      if (self.props.opened) self.props.opened(); //self._setupPageKeyPressed(false); 
      self._initTradeSlider();
      $("#searchTicker").focus();
      $("#searchTicker").select();
    });

    $("#addHoldingModal").on('hidden.bs.modal', function() { 
      $("#searchTicker").typeahead('val', '')     
      $("#searchTicker").typeahead('close');
      self._initTradeSlider();
      if (self.props.closed) self.props.closed(); //self._setupPageKeyPressed(true); 
    });   
  },

  componentDidMount() {
    // console.log('AddStockModal.componentDidMount');
    this._init();
  }, 

  componentWillReceiveProps(nextProps) {
    // console.log('AddStockModal.componentWillReceiveProps'); console.dir(nextProps);

    if (nextProps.isOpen && !this.props.isOpen) {
      $('#addHoldingModal').modal('show'); 
      // if (nextProps.opened) nextProps.opened(); //dialog has its own lifecycle hooks above
    }
    else if (!nextProps.isOpen && this.props.isOpen) {
      $('#addHoldingModal').modal('hide');      
      // if (nextProps.closed) nextProps.closed(); //dialog has its own lifecycle hooks above    
    }
  },

  render: function() {    
    return(
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
              <button className="btn btn-primary" id="addHoldingModalAdd" onClick={this._okClicked}>Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  },

});
