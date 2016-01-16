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

  authenticationChanged(authenticated) {
    //bit of a hack i know
    this.state.authenticated = authenticated;
    window.__ReactInitState__['_authenticated'] = this.state.authenticated;
    this.setState({authenticated: this.state.authenticated});
  },

  getInitialState() {
    //return {authenticated: App.isAuthenticated()};
    return {authenticated: true};
  },

  componentDidMount() {
    App.registerAuthenticatedChanged(this.authenticationChanged);

    //return {authenticated: App.isAuthenticated()};
    return {authenticated: true};
  },

  render: function() {
    //var athenticated = this.state.authenticated ? 'AUTHENTICATED' : 'Guest';
    if (this.state.authenticated) {
      return (
        <div>
          <nav className="navbar-inverse navbar-fixed-top">
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
