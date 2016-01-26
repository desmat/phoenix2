var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;

var createBrowserHistory = require('history/lib/createBrowserHistory');
var routes = require('../Routes.jsx');

/*
 * On the front-end, look for element react-content and render React component tree
 */ 

if (typeof document == "object") {
	//console.log('running router on client side!');


  //Material-ui dependency
  //
  //Needed for onTouchTap
  //Can go away when react 1.0 release
  //Check this repo:
  //https://github.com/zilverline/react-tap-event-plugin  
  var injectTapEventPlugin = require("react-tap-event-plugin");
  injectTapEventPlugin();


	//init react router on front-end

	var targetElement = document.getElementById('react-content');

	if (typeof targetElement !== 'undefined' && targetElement != null) {
		//console.log('Rendering ReactDOM');   

		ReactDOM.render((
		  <Router history={createBrowserHistory()}>
		    {routes}
		  </Router>
		), targetElement);
	}
}
