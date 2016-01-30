var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  _fabClicked() {
    // console.log('PortfolioHoldingDialog._fabClicked');
    if (typeof this.state.open !== 'undefined' && this.state.open) {
      var shares = document.getElementById('trade-slider').noUiSlider.get();
      // console.log('PortfolioHoldingDialog._fabClicked: trade: ' + this.props.portfolioHolding.ticker + ': ' + parseInt(shares - this.props.portfolioHolding.shares));

      if (shares - this.props.portfolioHolding.shares > 0) {
        this.props.buyStock(this.props.portfolioHolding.ticker, shares - this.props.portfolioHolding.shares);
      }
      else if (shares - this.props.portfolioHolding.shares < 0) {
        this.props.sellStock(this.props.portfolioHolding.ticker, Math.abs(shares - this.props.portfolioHolding.shares));
      }

     this.setState({open: false, dirty: false});
    }
    else {
      $('#addHoldingModal').modal('show');
    }
  },

  _initTradeSlider(portfolioHolding, cash) {
    // console.log('PortfolioHoldingDialog._initTradeSlider');
    var self = this;
    var quantity = 0;
    var min = 0;
    var max = 1;
    var step = 1;
    var disabled = true;

    if (portfolioHolding) {
      quantity = portfolioHolding.shares;
      max = Math.floor((cash / portfolioHolding.price) + quantity);
      disabled = false;
    }

    var slider = document.getElementById('trade-slider');
    var sliderIndicator = $('#trade-slider-indicator');

    if (slider.noUiSlider && slider.noUiSlider.destroy) slider.noUiSlider.destroy(slider);

    noUiSlider.create(slider, {
      start: quantity,
      // connect: true,
      step: 1,
      range: {
        'min': min,
        'max': max
      }
    }); 

    slider.noUiSlider.on('update', function(){
      var count = slider.noUiSlider.get();
      if (count > quantity) {
        sliderIndicator.html('Trade shares (+' + parseInt(count - quantity) + ')');
        self.setState({dirty: true});
      }
      else if (count < quantity) {
        sliderIndicator.html('Trade shares (' + parseInt(count - quantity) + ')');
        self.setState({dirty: true});
      }
      else {
        sliderIndicator.html('Trade shares');
        self.setState({dirty: false});
      }
    });

    if (disabled) {
      slider.setAttribute('disabled', disabled) 
    }
    else {
      slider.removeAttribute('disabled');
    }             
  },

  _init() {
    // console.log('PorfolioHoldingDialog._init');

    this._initTradeSlider();
  },

  getInitialState() {
    // console.log('PortfolioHoldingDialog.getInitialState');

    return {open: this.props.open, dirty: false};
  },  

  componentDidMount() {
    // console.log('PorfolioHoldingDialog.componentDidMount');

    this._init();
  }, 

  componentWillReceiveProps(nextProps) {
    console.log('PorfolioHoldingDialog.componentWillReceiveProps');

    this.setState({open: nextProps.open});

    if (nextProps.portfolioHolding && (!this.props.portfolioHolding || nextProps.portfolioHolding.id != this.props.portfolioHolding.id)) {
      this._initTradeSlider(nextProps.portfolioHolding, nextProps.cash);
      $('.dialog-content').html('Details for ' + nextProps.portfolioHolding.ticker + ' holding');
    }
  },

  componentDidUpdate() {
    console.log('PorfolioHoldingDialog.componentDidUpdate');

    //only callback when component has data (portfolioHolding)
    if (this.props.portfolioHolding && this.props.opened && this.state.open) this.props.opened();
    if (this.props.portfolioHolding && this.props.closed && !this.state.open) this.props.closed();
  },

  render: function() {    
    // console.log('PorfolioHoldingDialog.render');
    return(
      <div className="portfolio-holding-dialog">
        <div className={`fab-container ${this.state.open ? 'fab-container-open' : ''} ${this.state.dirty ? 'fab-container-dirty' : ''}`}>
          <button className={`btn btn-raised btn-fab ${this.state.dirty ? 'btn-warning' : this.state.open ? 'btn-default' : 'btn-primary'}`} onClick={this._fabClicked} id="addholding"><i className="material-icons">{this.state.open ? this.state.dirty ? 'check' : 'arrow_drop_down' : 'add'}</i></button>
        </div>          

        <div className={`well dialog-panel ${this.state.open ? 'dialog-panel-open' : ''}`}>
          <p className="text-center"></p>
          <p className="text-center dialog-content">TODO put things here</p>
          {/*
          <div className="text-center">
            <p><button className="btn btn-danger" onClick={this.sellStock}>Sell</button> <button className="btn btn-primary" onClick={this.buyStock}>Buy</button></p>
          </div>
          */}
          <div className="portfolio-holding-dialog-slider-container">
            <div id="trade-slider-indicator">Trade shares</div>
            <div id="trade-slider" className="slider shor slider-primary"></div>          
          </div>

          {/*
          <div className={`fab-container-close ${this.state.open ? 'fab-container-close' : ''}`}  >
            <button href="#" className="btn btn-default btn-raised btn-fab" onClick={this._closeDialogPanel}><i className="material-icons">arrow_drop_down</i></button>
          </div>                    
          */}
        </div>
      </div>
    );
  },

});




