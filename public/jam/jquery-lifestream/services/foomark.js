define('jam/jquery-lifestream/services/foomark', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      bookmarked: Handlebars.compile('bookmarked <a href="{{url}}">{{url}}</a>')
    },
    config.template);

  $.ajax({
    url: "http://api.foomark.com/urls/list/",
    data: {
      format: "jsonp",
      username: config.user
    },
    dataType: "jsonp",
    success: function( data ) {

      var output = [], i=0, j;
      if( data && data.length && data.length > 0 ) {
        j = data.length;
        for( ; i < j; i++ ) {
          var item = data[i];
          output.push({
            date: new Date( item.created_at.replace(/-/g, '/') ),
            config: config,
            html: template.bookmarked( item )
          });
        }
      }
      callback( output );
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});
