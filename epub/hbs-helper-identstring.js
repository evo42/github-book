// Generated by CoffeeScript 1.3.3
(function() {

  define('template/helpers/identstring', ['handlebars'], function(Handlebars) {
    var fn;
    fn = function(str) {
      str = str.replace(/\//g, '-');
      str = str.replace(/\./g, '-');
      return str;
    };
    Handlebars.registerHelper('identstring', fn);
    return fn;
  });

}).call(this);
