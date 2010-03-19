var namespace = function(name, container){
  var i, len, ns=name.split('.'), o=container || window;
  for(i = 0, len = ns.length; i < len; i++){
    o = o[ns[i]] = o[ns[i]] || {};
  }
  return o;
};

