var Api = require('./Api');

module.exports = {

  registerSocketIo(component, model, fn) {
    //console.log('App.registerSocketIo');

    if (typeof window !== 'undefined') {
      if (!window.hasOwnProperty('__ReactSocketIoCallbacks__')) {
        window.__ReactSocketIoCallbacks__ = {};
        window.__ReactSocketIoCallbackCallers__ = {};
      }

      if (!window.__ReactSocketIoCallbacks__.hasOwnProperty(model)) {
        //console.log('App.registerSocketIo: setting up iosocket callback for model [' + model + ']');
        window.__ReactSocketIoCallbacks__[model] = {};

        var f = function(msg) {
          _.each(Object.keys(window.__ReactSocketIoCallbacks__[model]), function(key) {
            // console.log('App.registerSocketIo: calling iosocket callback for component [' + key + ']');
            window.__ReactSocketIoCallbacks__[model][key](msg);
          });
        };

        // console.log('App.registerSocketIo: setting up iosocket callback for model [' + model + ']: actually setting up io.socket');
        window.__ReactSocketIoCallbackCallers__[model] = f;
        io.socket.on(model, f);
      }

      if (fn) {
        // console.log('App.registerSocketIo: registering component [' + component + '] for callback on model [' + model + ']');
        window.__ReactSocketIoCallbacks__[model][component] = fn;
      }
      else {
        // console.log('App.registerSocketIo: de-registering component [' + component + '] for callback on model [' + model + ']');
        delete window.__ReactSocketIoCallbacks__[model][component];
      }
    }
  },

  init() {
    //client-side
    if (typeof window !== 'undefined') {
      //enable bootstrap tooltip
      var node = $('[data-toggle="tooltip"]');
      if (typeof node !== 'undefined') node.tooltip(); 

      //more here
    }
    //server-side
    else {
      
      //more here
    }
  },

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      if (window.hasOwnProperty('__ReactInitState__') && 
          window.__ReactInitState__.hasOwnProperty('_authenticated')) {
        return window.__ReactInitState__['_authenticated'];
      }
    }
    else if (typeof global !== 'undefined') {
      if (global.hasOwnProperty('__ReactInitState__') && 
          global.__ReactInitState__.hasOwnProperty('_authenticated')) {
        return global.__ReactInitState__['_authenticated'];
      }
    }

    return false;    
  },

  registerAuthenticatedChanged(func) {
    //super hack! I need to figure out how to not use global scope to pass along callbacks in this manner...
    if (typeof window !== 'undefined') {
      window.__ReactNavAuthenticationChanged = func;
    }
  },

  login(username, password, onSuccess, onError) {
    Api.post('login', {username: username, password: password}, function(data) {
      if (data.hasOwnProperty('login') && data.login == 'ok') {
        window.__ReactNavAuthenticationChanged(true);
        if (onSuccess) onSuccess();
      }
      else {
        var msg = data.hasOwnProperty('error') ? data.error : '(unknown)';
        //console.log("Unable to login: " + msg);
        if (onError) onError(msg);
      }
    });
  },

  register(username, password, onSuccess, onError) {
    Api.post('register', {username: username, password: password}, function(data) {
      //console.dir(data);
      if (data.hasOwnProperty('register') && data.register == 'ok') {
        window.__ReactNavAuthenticationChanged(true);
        if (onSuccess) onSuccess();
      }
      else {
        var msg = data.hasOwnProperty('error') ? data.error : '(unknown)';
        //console.log("Unable to register: " + msg);
        if (onError) onError(msg);   
      }
    });

  },

  logout(onSuccess, onError) {
    //bit of a hack i know
    window.__ReactInitState__ = {};
    window.__ReactNavAuthenticationChanged(false);

    Api.post('logout', function() {
      if (onSuccess) onSuccess();
    }, function(error) {
      if (onError) onError();
    });
  },

  navigate(url) {
    //bit of a hack i know
    window.__ReactNavigate(url);
  },

  registerNavigate(func) {
    if (typeof window !== 'undefined') {
      window.__ReactNavigate = func;
    }    
  },
  
};
