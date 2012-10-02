define('js/app',[
    'jquery',
    'garden-app-support',
    'director',
    'events',
    'js/quick',
    'js/position'
],
function($, garden, director, events, quick, position){
    var exports = {};
    var emitter = new events.EventEmitter();
    var coords;

    /**
     * This is where you will put things you can do before the dom is loaded.
     */
    exports.init = function() {
        position.init(function(err, positionInfo) {
            coords = positionInfo.coords;
            emitter.emit('location', coords);
        });
        quick.setSelector('.main');
    }

    /**
     * This that occur after the dom has loaded.
     */
    exports.on_dom_ready = function(){
        router = director.Router({
            '/quick/tag' : quick.tag,
            '/quick/people' : quick.people,
            '/quick/journal' : quick.journal,
            '/quick' : function() {
                router.setRoute('/quick/tag');
            }
        });
        router.init('/quick/tag');
    }
    return exports;
});