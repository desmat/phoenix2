var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  _fabClicked() {
    // console.log('PortfolioHoldingDialog._fabClicked');
    if (typeof this.props.isOpen !== 'undefined' && this.props.isOpen) {
      var shares = document.getElementById('trade-slider').noUiSlider.get();
      var quantity = shares - this.props.portfolioHolding.shares;
      // console.log('PortfolioHoldingDialog._fabClicked: trade: ' + this.props.portfolioHolding.ticker + ': ' + parseInt(shares - this.props.portfolioHolding.shares));

      this.setState({open: false, dirty: false});

      if (quantity && this.props.close) {
        this.props.close({ticker: this.props.portfolioHolding.ticker, quantity: quantity});
      }
      else if (this.props.close) {
        this.props.close();
      }
    }
    else if (this.props.fabClicked) {
      this.props.fabClicked()
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

  _setupPageKeyPressed(set){
    // console.log('PorfolioHoldingDialog._setupPageKeyPressed(' + set + ')');
    var self = this;

    if (set) {
      $(document).on('keydown', function(e) {
        /*if (e.keyCode == 13) {
          self._fabClicked();
        }
        else */if (e.keyCode == 27) {
          self.setState({open: false, dirty: false});
          self.props.close();
        }
      });
    }
    else {
      $(document).off('keypress');      
    }
  },

  getInitialState() {
    // console.log('PortfolioHoldingDialog.getInitialState');

    return {dirty: false};
  },  

  componentDidMount() {
    // console.log('PorfolioHoldingDialog.componentDidMount');
    var self = this;

    this._initTradeSlider();

    //enable swipe-down to close dialog
    $(".portfolio-holding-dialog").swipe({
      swipe: function(event, direction) {
        if (direction == 'down') {
          self.setState({open: false, dirty: false});
          self.props.close();
        }
      },
      threshold:20
    });
  }, 

  componentWillUnmount() {
    // console.log('PorfolioHoldingDialog.componentWillUnmount');
    this._setupPageKeyPressed(false);
  },

  componentWillReceiveProps(nextProps) {
    // console.log('PorfolioHoldingDialog.componentWillReceiveProps');

    if (nextProps.isOpen && nextProps.portfolioHolding && (!this.props.portfolioHolding || nextProps.portfolioHolding.id != this.props.portfolioHolding.id)) {
      this._initTradeSlider(nextProps.portfolioHolding, nextProps.cash);
      $('.dialog-content').html('Details for ' + nextProps.portfolioHolding.ticker + ' holding');
    }

    if (nextProps.isOpen && !this.props.isOpen) {
      this._setupPageKeyPressed(true);
      if (nextProps.opened) nextProps.opened(); 
    }
    else if (!nextProps.isOpen && this.props.isOpen) {
      this._setupPageKeyPressed(false);
      if (nextProps.closed) nextProps.closed(); 
    }
  },

  componentDidUpdate() {
    // console.log('PorfolioHoldingDialog.componentDidUpdate');
  },

  render: function() {    
    // console.log('PorfolioHoldingDialog.render');
    return(
      <div className="portfolio-holding-dialog swipe-down-cancel">
        <div className={`fab-container ${this.props.isOpen ? 'fab-container-open' : ''} ${this.state.dirty ? 'fab-container-dirty' : ''}`}>
          <button className={`btn btn-raised btn-fab swipe-down-cancel ${this.state.dirty ? 'btn-warning' : this.props.isOpen ? 'btn-default' : 'btn-primary'}`} onClick={this._fabClicked} id="addholding"><i className="material-icons">{this.props.isOpen ? this.state.dirty ? 'check' : 'arrow_drop_down' : 'add'}</i></button>
        </div>          

        <div className={`well dialog-panel ${this.props.isOpen ? 'dialog-panel-open' : ''}`}>
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
          <div className={`fab-container-close ${this.props.isOpen ? 'fab-container-close' : ''}`}  >
            <button href="#" className="btn btn-default btn-raised btn-fab" onClick={this._closeDialogPanel}><i className="material-icons">arrow_drop_down</i></button>
          </div>                    
          */}
        </div>
      </div>
    );
  },

});




