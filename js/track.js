/**
 * User: ryan
 * Date: 12-10-04
 * Time: 7:32 PM
 */
define('js/Track', ['underscore', 'Class', 'd3'], function (_, Class, d3) {
    return Class.design('Track', {
        initialize: function(settings, chart_details) {
            this.settings = settings;
            this.chart_details = chart_details;
            // for ease of use
            this.x = chart_details.x;
            this.y = chart_details.y;
            this.group = chart_details.group;

            var me = this;
            this.chart_details.emitter.on('zoom', function(x_scale){
                me.zoom.call(me, x_scale);
            });
        },

        draw : function(){
            var me = this;
            /* All tracks will have this */
            // draw a line at the bottom of the track to give it some seperation
            this.group.append('line')
                    .attr("x1", 1)
                    .attr("y1", me.settings.y + me.settings.height)
                    .attr("x2", me.chart_details.width)
                    .attr("y2", me.settings.y + me.settings.height)
                    .style("stroke", "rgb(230,230,230)");


        },
        zoom : function(x_scale) {
            this.x = x_scale;
        }
    });
});