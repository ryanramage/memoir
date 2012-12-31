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
    'js/scales',
    'js/audio_player_controller'
], 

function (Track, Class, couchr, _, scales, audio_controller) {
    var AudioTrack = Class.design('AudioTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            AudioTrack.Super.call(this, settings, chart_details);
            var me = this;

            me.getEntries = function(callback) {
                var domain = me.chart_details.x.domain();

                var starttime  = domain[0].getTime();
                var endtime = domain[1].getTime();
                //var scale = scales.getScale(domain);
                // if (scale == scales.minute) 
                // TODO - depending on scale, should limit the amount of data coming back
                audio_controller.get_playlist(starttime, endtime, callback);
            }

            me.drawEntries = function(err, results) {
                var rect = me.space.selectAll("rect")
                    .data(results.rows,  function(d) { return d.id; })

                var centre_date = scales.getMeanDate(me.x.domain());
                var centre_time = centre_date.getTime();
                var centre_audio = null;

                //enter
                rect.enter().append("rect")
                    .attr("class", function(d) {  
                        if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) return 'audio-tag-center ';
                        else return 'audio-tag';
                    })
                    .attr("x", function(d) { return me.x(new Date(d.value.start)); })
                    .attr("y", me.settings.y + 1)
                    .attr("height",me.settings.height - 1)
                    .attr("width", function(d) { return   (me.x(new Date(d.value.end + 1000 )) - me.x(new Date(d.value.start))) || 1 ;}   )
                    .attr("fill", "#2d578b")


                //update
                rect.attr("x", function(d) { return me.x(new Date(d.value.start)); })
                    .attr("width", function(d) { return   (me.x(new Date(d.value.end + 1000 )) - me.x(new Date(d.value.start))) || 1 ;}   )
                    .attr("class", function(d) {  
                        if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) {
                            centre_audio = d;
                            return 'audio-tag-center '
                        }
                        else return 'audio-tag';
                    });

                // delete
                rect.exit()
                    .remove();

                if (centre_audio) {
                    audio_controller.cache_playlist({
                        playlist: results, 
                        current_track: centre_audio,
                        centre_time: centre_time
                    });          
                }


            }
            me.drawEntriesDebounced = _.debounce(function(){
                me.getEntries(me.drawEntries);
            }, 200);

        },
        draw: function() {
            AudioTrack.Super.prototype.draw.call(this);
            this.space = this.chart_details.group.append("g").attr("clip-path", "url(#clip)"); 
            this.getEntries(this.drawEntries);         
        },
        zoom: function(x_domain, quick) {
            AudioTrack.Super.prototype.zoom.call(this, x_domain, quick);
            var me = this;

            me.space.selectAll("rect")
                .attr("x", function(d) { return me.x(new Date(d.value.start)); })
                .attr("width", function(d) { return   (me.x(new Date(d.value.end + 1000)) - me.x(new Date(d.value.start))) || 1 ;}   );
            if (!quick) me.drawEntriesDebounced();
        }
    })
    return AudioTrack;
});