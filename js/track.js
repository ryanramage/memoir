/**
 * User: ryan
 * Date: 12-10-04
 * Time: 7:32 PM
 */
define('js/Track', ['underscore', 'Class', 'd3'], function (_, Class, d3) {
    return Class.design('Track', {
        initialize: function(settings, x, y, group, emitter) {
            this.settings = settings;
            this.x = x;
            this.y = y;
            this.group = group;
            this.emitter = emitter;
            var me = this;
            this.emitter.on('zoom', function(x_scale){
                me.zoom.call(me, x_scale);
            });

        },

        draw : function(){
            // the baseline track drawing.

        },
        zoom : function(x_scale) {
            this.x = x_scale;
        }
    });
});