var React = require("react");
var Router = require("react-router");
var Route = Router.Route;
var IndexRoute = Router.IndexRoute;
var Link = Router.Link;
var createBrowserHistory = require('history/lib/createBrowserHistory');

/* 
 * New attribute 'data' is supported and maps to api end-points.
 * Supports queries (Foo?bar=car) and record-specific path (Foo/123).
 * Note: for user-specific data, use query param userId=:userId where userId is a field on said data
 */
module.exports = (
    <Route path="/" component={require("./Body.jsx")}  >
      <IndexRoute component={require("./Portfolios.jsx")} data="portfolio"/>
      <Route path="portfolio/:id" component={require("./PortfolioDetails.jsx")} data="portfolioDetails/:id"/>
      <Route path="about" component={require("./About.jsx")} data="about portfolio" />
      <Route path="login" component={require("./Login.jsx")} />
      <Route path="register" component={require("./Register.jsx")} />
    </Route>
);
