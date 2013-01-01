define('js/timeline',[
    'jquery',
    'underscore',
    'handlebars',
    'couchr',
    'd3',
    'store',
    'events',
    'moment',
    'js/scales',
    'js/AudioTrack',
    'js/ImageTrack',
    'js/JournalTrack',
    'js/ScrapbookTrack',
    'js/ServiceTrack',
    'js/TagTrack',
    'js/date_utils',
    'js/audio_player_controller',    
    'hbt!templates/timeline'
], function($, _, handlebars, couchr, d3, store, events, moment, scales, AudioTrack, ImageTrack, JournalTrack, ScrapbookTrack, ServiceTrack, TagTrack, date_utils, audio_controller, timeline_t){
    var exports = {};
    var selector = '.main'
    var $canvas;
    var $gutter;
    var options;
    var x, y, xAxis, yAxis, x_zoom, scrubber_date, track_space;
    // this is the main emitter that the tracks will use
    var track_emitter = new events.EventEmitter();


    exports.init = function (opts) {
        options = opts;
        selector = options.selector;
    }



    exports.time = function(textDate) {
        options.emitter.emit('section', 'timeline');
        var initialDate = date_utils.parseDate(textDate);
        var scale_info = scales.getToScaleInfo(initialDate, scales.week);
        createTimeline(initialDate, scale_info);
    }

    exports.now = function(){
       options.emitter.emit('section', 'timeline');
       $(selector).html(timeline_t());
       var initialDate = new Date();
       var scale_info = scales.getToScaleInfo(initialDate, scales.week);
       var stored_timeline = store.get('timeline_current');
       if (stored_timeline) {
           initialDate = date_utils.parseDate(stored_timeline.date);
           scale_info = scales.getToScaleInfo(initialDate, stored_timeline.duration);
       }
       createTimeline(initialDate, scale_info);
    }

    exports.time_and_zoom = function(textDate, zoom) {
        options.emitter.emit('section', 'timeline');
        $(selector).html(timeline_t());
        var initialDate = date_utils.parseDate(textDate);
        var scale_info = scales.getToScaleInfo(initialDate, zoom);
        createTimeline(initialDate, scale_info);
    }


    exports.routes = function() {


       return  {
           '/timeline' : exports.now,
           '/timeline/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2})' : exports.time,
           '/timeline/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2})/(\\d+)' : exports.time_and_zoom
        }
    }


    function get_tracks(callback) {
        //couchr.get('_tracks', _.cbalter(callback, 'rows'));
        callback(null, {
            rows : [
                {
                    track_type: 'tag',
                    name : 'Tags',
                    y: 0,
                    height: 30
                },
                {
                    track_type: 'image',
                    name : 'Images',
                    y: 31,
                    height: 60
                },
                {
                    track_type: 'audio',
                    name : 'Audio',
                    y: 91,
                    height: 30
                },                
                {
                    track_type: 'service',
                    name : 'Ryan Github',
                    y: 121,
                    height: 16,
                    service_name: 'github'
                },
                {
                    track_type: 'service',
                    name : 'Eckoit',
                    y: 138,
                    height: 16,
                    service_name: 'twitter'
                }
            ]
        });
    }



    function init_tracks (x, y, width, height, group, emitter, $canvas, $gutter, callback) {
        get_tracks(function(err, tracks){
            var objectified = [];

            var chart_details = {
                x : x,
                y : y,
                width : width,
                height : height,
                group : group,
                emitter : emitter,
                $canvas : $canvas,
                $gutter : $gutter
            }
            _.each(tracks.rows, function(track){
                switch (track.track_type) {
                    case 'audio'     : objectified.push(new AudioTrack(track, chart_details)); break;
                    case 'image'     : objectified.push(new ImageTrack(track, chart_details)); break;
                    case 'journal'   : objectified.push(new JournalTrack(track, chart_details)); break;
                    case 'scrapbook' : objectified.push(new ScrapbookTrack(track, chart_details)); break;
                    case 'service'   : objectified.push(new ServiceTrack(track, chart_details)); break;
                    case 'tag'       : objectified.push(new TagTrack(track, chart_details)); break;
                    default : console.log('unknown track type', track);
                }
            })
            callback(null, objectified);
        });
    }

    function draw_tracks(tracks) {
        _.each(tracks, function(track){
            track.draw();
        })
    }




    function createTimeline(initialDate, scale_info) {



        var margin = {top: 0, right: 0, bottom: 12, left: 24},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        $timeline = $(selector).find('.timeline');
        $canvas = $(selector).find('.canvas');
        $gutter = $(selector).find('.gutter');

        $canvas.width(width).height(height);
        $gutter.height(height);
        $timeline.width(width + $gutter.width());



        x = d3.time.scale()
            .domain([scale_info.left_date, scale_info.right_date])
            .range([0, width]);

        y = d3.scale.linear()
            .domain([0, height])
            .range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(-height);

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(0)
            .tickSize(-width);

        x_zoom = d3.behavior.zoom();

        var svg = d3.select($canvas.get(0)).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(x_zoom.x(x).scaleExtent(scale_info.scale_extent).on("zoom", function(){
                audio_controller.seeking();
                zoom(true);
                
            }));

        svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        svg.append("rect")
            .attr("class", "bg")
            .attr("width", width)
            .attr("height", height);

        track_space =  svg.append("g")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")



        /** The scrubber **/

        svg.append('line')
                .attr("x1", width/2 - 1)
                .attr("y1", 1)
                .attr("x2", width/2 - 1)
                .attr("y2", height)
                .style("stroke", "rgb(6,120,155)");



        /**
         * The Axis
         */
        track_space.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        track_space.append("g")
            .attr("class", "y axis")
            .call(yAxis);



        





        init_tracks(x, y, width, height, track_space, track_emitter, $canvas, $gutter, function(err, tracks){
           draw_tracks(tracks);
        });


        exports.show_centre_date(initialDate);




        function zoomButton(middle_date, to_scale) {
            redrawToDates(scales.getToScaleInfo(middle_date, to_scale));
        }


        $(function() {
            $('.btn.zoom_in').on('click',function(){
                var current_domain = x.domain();
                var scale = scales.getScale(current_domain);
                var middle_date = scales.getMeanDate(current_domain);
                zoomButton(middle_date, scales.zoomInSingleToScale(middle_date, scale));


            });
            $('.btn.zoom_out').on('click',function(){
                var current_domain = x.domain();
                var scale = scales.getScale(current_domain);
                var middle_date = scales.getMeanDate(current_domain);
                zoomButton(middle_date, scales.zoomOutSingleToScale(middle_date, scale));


            });


        });

    }

    var update_url_hash_instant = function(){
        if (_.isFunction(history.replaceState)) {
            var date = date_utils.stringifyDate(scrubber_date);
            var duration = scales.getDuration(x.domain());
            _.defer(function(){
                var duration = scales.getDuration(x.domain());
                store.set('timeline_current', { date : date, duration: duration })
            });
            history.replaceState({}, date, "#/timeline/" + date + '/' + duration);
        }
    }

    var update_url_hash = _.debounce(update_url_hash_instant, 150);

    var play_audio = function() {
        var range = x.domain();
        var play_date = new Date( d3.mean(range, function(d){ return d.getTime()  }));
        audio_controller.play( play_date );
    }
    var play_audio_debounced = _.debounce(play_audio, 0);

    function zoom(play_audio) {
        var range = x.domain();
        track_space.select(".x.axis").call(xAxis);
        track_space.select(".y.axis").call(yAxis);

        scrubber_date = new Date( d3.mean(range, function(d){ return d.getTime()  }));
        update_url_hash();
        exports.show_centre_date(scrubber_date);
        track_emitter.emit('zoom', x, false);
        if (play_audio) {
            play_audio_debounced();
        }
    }
    function redrawToDates(scale_info) {
        x.domain([scale_info.left_date, scale_info.right_date]);
        
        x_zoom.x(x);//.scaleExtent(scale_info.scale_extent);
        //_.defer(zoom);
        zoom();
    }


    audio_controller.get_emitter().on('progress', function(details){
        var current_duration = scales.getDuration(x.domain());
        var scale_info = scales.getToScaleInfo(details.date, current_duration);
        x.domain([scale_info.left_date, scale_info.right_date]);            
        //x_zoom.x(x);//.scaleExtent(scale_info.scale_extent);
        var range = x.domain();
        track_space.select(".x.axis").call(xAxis);
        track_space.select(".y.axis").call(yAxis);

        scrubber_date = new Date( d3.mean(range, function(d){ return d.getTime()  }));
        update_url_hash_instant();
        exports.show_centre_date(scrubber_date);
        track_emitter.emit('zoom', x, true);
    });
    exports.show_centre_date = function(date) {
        var d_str = moment(date).format('ddd MMM D, h:mm:ss a, YYYY');
        $('.toolbar .centre-date').text(d_str);
    }

    return exports;
})