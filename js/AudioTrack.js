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
    'spin-js',
    'js/scales',
    'js/audio_player_controller'
],

function (Track, Class, couchr, _, Spinner, scales, audio_controller) {



    var AudioTrack = Class.design('AudioTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            AudioTrack.Super.call(this, settings, chart_details);
            var me = this;


            var audio_emitter = audio_controller.get_emitter();
            audio_emitter.on('seeking',   function(){ me.spin() } );
            audio_emitter.on('loadstart', function(){ me.spin() } );
            audio_emitter.on('ended',     function(){ me.spin() } );
            audio_emitter.on('progress',  function(){ me.spin_off() } );
            me.spin_showing = false;

            // add a div to the right of this
            this.icon = $('<div id="audio-spinner" class="audio-spinner"></div>');
            this.icon.css('top', this.settings.y + 'px');
            this.icon.appendTo(this.chart_details.$gutter);

            var opts = {
              lines: 7, // The number of lines to draw
              length: 6, // The length of each line
              width: 3, // The line thickness
              radius: 0, // The radius of the inner circle
              corners: 0.3, // Corner roundness (0..1)
              rotate: 0, // The rotation offset
              color: '#000', // #rgb or #rrggbb
              speed: 2.0, // Rounds per second
              trail: 29, // Afterglow percentage
              shadow: false, // Whether to render a shadow
              hwaccel: false, // Whether to use hardware acceleration
              className: 'spinner', // The CSS class to assign to the spinner
              zIndex: 2e9, // The z-index (defaults to 2000000000)
              top: 'auto', // Top position relative to parent in px
              left: 'auto' // Left position relative to parent in px
            };
            var target = document.getElementById('audio-spinner');
            me.spinner = new Spinner.Spinner(opts).spin(target);
            me.spinner.stop();


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
        spin: function() {
            if (!this.spin_showing) this.spinner.spin(document.getElementById('audio-spinner'));
            this.spin_showing = true;
        },
        spin_off: function() {
            if (this.spin_showing) this.spinner.stop();
            this.spin_showing = false;
        },
        draw: function() {
            AudioTrack.Super.prototype.draw.call(this);
            this.space = this.chart_details.group.append("g").attr("clip-path", "url(#clip)");


            this.getEntries(this.drawEntries);
        },
        zoom: function(x_domain, quick) {
            AudioTrack.Super.prototype.zoom.call(this, x_domain, quick);
            var me = this;

            var centre_date = scales.getMeanDate(me.x.domain());
            var centre_time = centre_date.getTime();
            me.space.selectAll("rect")
                .attr("x", function(d) { return me.x(new Date(d.value.start)); })
                .attr("width", function(d) { return   (me.x(new Date(d.value.end + 1000)) - me.x(new Date(d.value.start))) || 1 ;}   )
                .attr("class", function(d) {
                        if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) {
                            return 'audio-tag-center '
                        }
                        else return 'audio-tag';
                    });

            if (!quick) me.drawEntriesDebounced();
        },
        distroy: function() {

        }
    })
    return AudioTrack;
});