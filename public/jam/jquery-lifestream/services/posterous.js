define('jam/jquery-lifestream/services/posterous', ['jquery', 'handlebars'], function(_, Handlebars){
return function( config, callback ) {

  var template = $.extend({},
    {
      posted: Handlebars.compile('posted <a href="{{link}}">{{title}}</a>')
    },
    config.template);

  var parsePosterous = function ( input ) {
    var output = [], list, i = 0, j, item;

    if ( input.query && input.query.count && input.query.count > 0
        && input.query.results.rss.channel.item ) {
      list = input.query.results.rss.channel.item;
      j = list.length;
      for ( ; i < j; i++) {
        item = list[i];

        output.push({
          date: new Date( item.pubDate ),
          config: config,
          html: template.posted( item )
        });
      }
    }

    return output;
  };

  $.ajax({
    url: $.fn.lifestream.createYqlUrl('select * from xml where '
      + 'url="http://' + config.user + '.posterous.com/rss.xml"'),
    dataType: "jsonp",
    success: function ( data ) {
      callback(parsePosterous(data));
    }
  });

  // Expose the template.
  // We use this to check which templates are available
  return {
    "template" : template
  };

};
});