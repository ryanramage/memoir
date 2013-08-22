define('jam/jquery-lifestream/services/forrst', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      posted: Handlebars.compile('posted a {{post_type}} '
        + '<a href="{{post_url}}">{{title}}</a>')
    },
    config.template);

  $.ajax({
    url: "http://forrst.com/api/v2/users/posts?username=" + config.user,
    dataType: "jsonp",
    success: function(  data  ) {
      var output = [], i=0, j;
      if( data && data.resp.length && data.resp.length > 0 ) {
        j = data.resp.length;
        for( ; i < j; i++ ) {
          var item = data.resp[i];
          output.push({
            date: new Date( item.created_at.replace(' ', 'T') ),
            config: config,
            html: template.posted(item )
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