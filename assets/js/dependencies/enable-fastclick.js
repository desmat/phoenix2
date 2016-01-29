if (typeof document == "object") {
  document.body.onload = function() {
      window.FastClick.attach(document.body);
  };
}
