var React = require("react");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

module.exports = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <title>Project Phoenix</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta name="description" content="TODO" />
          <meta name="robots" />
          <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0, width=device-width, minimal-ui" />

{/*  for ios 7 style, multi-resolution icon of 152x152 */}
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-barstyle" content="black-translucent" >
{/* <link rel="apple-touch-icon" href="icon-152.png">  */}
{/* for Chrome on Android, multi-resolution icon of 196x196  */}
<meta name="mobile-web-app-capable" content="yes" />
{/* <link rel="shortcut icon" sizes="196x196" href="icon-196.png">  */}

          <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700" type="text/css" />
          <link href="//fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          <link href="/styles/bootstrap.min.css" rel="stylesheet" />
          <link href="/styles/bootstrap-material-design.min.css" rel="stylesheet" />
          <link href="/styles/ripples.min.css" rel="stylesheet" />
          <link href="/styles/font-awesome.min.css" rel="stylesheet"/>
          <link href="/styles/client.css" media="all" rel="stylesheet" />
        </head>
        <body>
          <div id="react-content" dangerouslySetInnerHTML={{__html: this.props.markup}} />
          <script dangerouslySetInnerHTML={{__html: this.props.locals.state}} />
          <script src="/js/dependencies/sails.io.js"></script>
          <script src="/js/dependencies/build.js"></script>
          <script src="/js/dependencies/jquery.min.js"></script>
          <script src="/js/dependencies/lodash.min.js"></script>
          <script src="/js/dependencies/bootstrap.min.js"></script>
          <script src="/js/dependencies/material.min.js"></script>
          <script src="/js/dependencies/ripples.min.js"></script>
          <script src="/js/dependencies/typeahead.bundle.min.js"></script>
          <script src="/js/bundle.js"></script>
        </body>
      </html>
    );
  }
});
