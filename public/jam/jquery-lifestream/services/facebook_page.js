define('jam/jquery-lifestream/services/facebook_page', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      wall_post: Handlebars.compile('post on wall <a href="{{link}}">{{title}}</a>')
    },
    config.template),

  /**
   * Parse the input from facebook
   */
  parseFBPage = function( input ) {
    var output = [], list, i = 0, j;

    if(input.query && input.query.count && input.query.count >0) {
	  list = input.query.results.rss.channel.item;
      j = list.length;
      for( ; i<j; i++) {
        var item = list[i];
        if( $.trim( item.title ) ){
          output.push({
            date: new Date(item["pubDate"]),
            config: config,
            html: template.wall_post(item )
          });
        }
      }
    }
    return output;
  };

  $.ajax({
    url: $.fn.lifestream.createYqlUrl('select * from xml where url="'
      + 'www.facebook.com/feeds/page.php?id='
      + config.user + '&format=rss20"'),
    dataType: 'jsonp',
    success: function( data ) {
	  callback(parseFBPage(data));
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});