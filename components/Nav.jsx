var React = require("react");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var Api = require('../assets/js/Api');
var App = require('../assets/js/App');

module.exports = React.createClass({

  logout() {
    //do front-end first to make it seem snappy
    this.authenticationChanged(false);
    App.navigate('/login');

    //logout backend
    App.logout();
  },

  authenticationChanged(authenticated, admin) {
    //bit of a hack i know
    this.state.authenticated = authenticated;
    this.state.admin = authenticated && admin
    window.__ReactInitState__['_authenticated'] = this.state.authenticated;
    window.__ReactInitState__['_admin'] = this.state.admin;
    this.setState({authenticated: this.state.authenticated, admin: this.state.admin});
  },

  getInitialState() {
    // return {authenticated: App.isAuthenticated(), admin: App.isAdmin()};
    return {authenticated: true, admin: true};
  },

  componentDidMount() {
    App.registerAuthenticatedChanged(this.authenticationChanged);

    // this.setState({authenticated: App.isAuthenticated(), admin: App.isAdmin()});
    return {authenticated: true, admin: true};
  },

  render: function() {
    //var athenticated = this.state.authenticated ? 'AUTHENTICATED' : 'Guest';
    if (this.state.authenticated && this.state.admin) {
      return (
        <div>
          <nav className="navbar-inverse">
              <div className="container-fluid">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <Link className="navbar-brand" to="/">Project Phoenix</Link>
                </div>
                <div id="navbar" className="navbar-collapse collapse">
                  <ul className="nav navbar-nav navbar-right">
                    <li><Link to="/" activeClassName="selected">Portfolios</Link></li>
                    <li><Link to="/ticker" activeClassName="selected">Tickers</Link></li>
                    <li><Link to="/about" activeClassName="selected">About</Link></li>
                    <li className="disabled"><a href="#" onClick={this.logout} activeClassName="selected">Logout</a></li>
                  </ul>
                </div>
              </div>
            </nav>
            <br/>
         </div>
      );
    }
    else if (this.state.authenticated) {
      return (
        <div>
          <nav className="navbar-inverse">
              <div className="container-fluid">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <Link className="navbar-brand" to="/">Project Phoenix</Link>
                </div>
                <div id="navbar" className="navbar-collapse collapse">
                  <ul className="nav navbar-nav navbar-right">
                    <li><Link to="/" activeClassName="selected">Portfolios</Link></li>
                    <li><Link to="/about" activeClassName="selected">About</Link></li>
                    <li className="disabled"><a href="#" onClick={this.logout} activeClassName="selected">Logout</a></li>
                  </ul>
                </div>
              </div>
            </nav>
            <br/>
         </div>
      );
    }
    else {
    	return (
    		<div>
    			<nav className="navbar-inverse">
    		      <div className="container-fluid">
    		        <div className="navbar-header">
    		          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
    		            <span className="sr-only">Toggle navigation</span>
    		            <span className="icon-bar"></span>
    		            <span className="icon-bar"></span>
    		          </button>
    		          <Link className="navbar-brand" to="/">Project Phoenix</Link>
    		        </div>
    		        <div id="navbar" className="navbar-collapse collapse">
    		          <ul className="nav navbar-nav navbar-right">
    		            <li><Link to="/about" activeClassName="selected">About</Link></li>
                    <li><Link to="/login" activeClassName="selected">Login</Link></li>
    		          </ul>
    		        </div>
    		      </div>
    		    </nav>
    		    <br/>
    		 </div>
    	);
    }
  }
});
