define('js/app',[
    'jquery',
    'garden-app-support',
    'director',
    'events',
    'js/quick',
    'js/position',
    'js/timeline',
    'js/settings',
    'js/people',
    'js/topics'
],
function($, garden, director, events, quick, position, timeline, settings, people, topics){
    var exports = {};
    var emitter = new events.EventEmitter();
    var coords;
    var routes = _.extend({}, quick.routes(), timeline.routes(), settings.routes(), people.routes(), topics.routes());

    /**
     * This is where you will put things you can do before the dom is loaded.
     */
    exports.init = function() {
        position.init(function(err, positionInfo) {
            coords = positionInfo.coords;
            emitter.emit('location', coords);
        });
        _.invoke([quick, timeline, settings, people, topics], 'init', {
            selector : '.main',
            emitter : emitter
        });
    };


    emitter.on("section", function(name){
        $('.sidebar-nav li').removeClass('active');
        $('.sidebar-nav').find('.' + name).addClass('active');
    });


    /**
     * This that occur after the dom has loaded.
     */
    exports.on_dom_ready = function(){
        router = director.Router(routes);
        router.init('/quick/journal');
    };
    return exports;
});