define(['jquery', 'underscore', 'couchr', 'async',
    'hbt!templates/topics_all',
    'hbt!templates/topics_view'
    ],
function($, _, couchr, async, all_t, view_t){
    var exports = {};

    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };

    function view(encoded) {
        showNav();
        topic = decodeURIComponent(encoded);
        $(selector).html(view_t({encoded: encoded, topic: topic}));
        showNav(name, 'wiki');
    }


    function all() {
        options.emitter.emit('section', 'topics');
        couchr.get('_ddoc/_view/topics_by_interaction', {reduce: true, group_level: 1}, function(err, results){

            var escaped = _.map(results.rows, function(row){
                row.escaped = encodeURIComponent(row.key);
                return row;
            });

            $(selector).html(all_t(escaped));
        });
    }

    exports.routes = function() {
       return  {
            '/topics/*': view,
            '/topics' : all
        };
    };


    function showNav(name, active) {
        options.emitter.emit('section', 'topics');
        $(selector).find('.nav-tabs').removeClass('active');
        $(selector).find('.' + active).addClass('active');
    }

    return exports;

});