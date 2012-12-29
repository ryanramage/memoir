/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:49 AM
 */
define([
    'js/Track', 
    'Class', 
    'couchr',
    'underscore',
    'js/scales'
], 

function (Track, Class, couchr, _, scales) {
    var AudioTrack = Class.design('AudioTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            AudioTrack.Super.call(this, settings, chart_details);
            var me = this;

            me.getEntries = function(callback) {
                var domain = me.chart_details.x.domain();

                var startkey = domain[0].getTime();
                //var scale = scales.getScale(domain);
                // if (scale == scales.minute) 

                startkey -= (11*60*1000); // get 11 min earlier


                // TODO - depending on scale, should limit the amount of data coming back
                var query = {
                    startkey : startkey,
                    endkey : domain[1].getTime(),
                    include_docs : false
                }
                couchr.get('_ddoc/_view/audio_by_time', query, callback )
            }

            me.drawEntries = function(err, results) {
                var rect = me.space.selectAll("rect")
                    .data(results.rows,  function(d) { return d.id; })

                var centre_date = scales.getMeanDate(me.x.domain());
                var centre_time = centre_date.getTime();

                //enter
                rect.enter().append("rect")
                    .attr("class", function(d) {  
                        if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) return 'audio-tag-center ';
                        else return 'audio-tag';
                    })
                    .attr("x", function(d) { return me.x(new Date(d.value.start)); })
                    .attr("y", me.settings.y + 1)
                    .attr("height",me.settings.height - 1)
                    .attr("width", function(d) { return   (me.x(new Date(d.value.end )) - me.x(new Date(d.value.start))) || 1 ;}   )
                    .attr("fill", "#2d578b")


                //update
                rect.attr("x", function(d) { return me.x(new Date(d.value.start)); })
                    .attr("width", function(d) { return   (me.x(new Date(d.value.end )) - me.x(new Date(d.value.start))) || 1 ;}   )
                    .attr("class", function(d) {  
                        if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) return 'audio-tag-center ';
                        else return 'audio-tag';
                    });

                // delete
                rect.exit()
                    .remove();
            }
            me.drawEntriesDebounced = _.debounce(function(){
                me.getEntries(me.drawEntries);
            }, 400);

        },
        draw: function() {
            AudioTrack.Super.prototype.draw.call(this);
            this.space = this.chart_details.group.append("g").attr("clip-path", "url(#clip)");

            // add a div to the right of this
            this.icon = $('<div class="lifestream-github timeline-service-icon"></div>');
            this.icon.css('top', this.settings.y + 'px');
            this.icon.appendTo(this.chart_details.$gutter);
            this.getEntries(this.drawEntries);            
        },
        zoom: function(x_domain) {
            AudioTrack.Super.prototype.zoom.call(this, x_domain);
            var me = this;

            me.space.selectAll("rect")
                .attr("x", function(d) { return me.x(new Date(d.value.start)); })
                .attr("width", function(d) { return   (me.x(new Date(d.value.end )) - me.x(new Date(d.value.start))) || 1 ;}   );
            
            me.drawEntriesDebounced();
        }
    })
    return AudioTrack;
});