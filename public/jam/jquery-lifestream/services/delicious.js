define('jam/jquery-lifestream/services/delicious', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      bookmarked: Handlebars('bookmarked <a href="{{u}}">{{d}}</a>')
    },
    config.template);

  $.ajax({
    url: "http://feeds.delicious.com/v2/json/" + config.user,
    dataType: "jsonp",
    success: function( data ) {
      var output = [], i = 0, j;
      if (data && data.length && data.length > 0) {
        j = data.length;
        for( ; i < j; i++) {
          var item = data[i];
          output.push({
            date: new Date(item.dt),
            config: config,
            html: template.bookmarked (item )
          });
        }
      }
      callback(output);
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});