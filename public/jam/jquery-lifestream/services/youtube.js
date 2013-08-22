define('jam/jquery-lifestream/services/youtube', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      favorited: Handlebars.compile('favorited <a href="{{video.player.default}}" '
        + 'title="{{video.description}}">{{video.title}}</a>')
    },
    config.template),

  parseYoutube = function( input ) {
    var output = [], i = 0, j, item;

    if(input.data && input.data.items) {
      j = input.data.items.length;
      for( ; i<j; i++) {
        item = input.data.items[i];
        output.push({
          date: new Date(item.created),
          config: config,
          html: template.favorited( item )
        });
      }
    }

    return output;
  };

  $.ajax({
    url: "http://gdata.youtube.com/feeds/api/users/" + config.user
      + "/favorites?v=2&alt=jsonc",
    dataType: 'jsonp',
    success: function( data ) {
      callback(parseYoutube(data));
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});