define('jam/jquery-lifestream/services/gimmebar', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      bookmarked: Handlebars.compile('bookmarked <a href="{{short_url}}">{{title}}</a>')
    },
    config.template);

  $.ajax({
    url: "https://gimmebar.com/api/v0/public/assets/" + config.user + ".json?jsonp_callback=?",
    dataType: "json",
    success: function( data ) {
      data = data.records;
      var output = [], i = 0, j;
      if (data && data.length && data.length > 0) {
        j = data.length;
        for( ; i < j; i++) {
          var item = data[i];
          output.push({
            date: new Date(item.date * 1000),
            config: config,
            html: template.bookmarked(item )
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
