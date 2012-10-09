define('js/timeline',[
    'jquery',
    'underscore',
    'handlebars',
    'couchr',
    'd3',
    'store',
    'events',
    'js/scales',
    'js/AudioTrack',
    'js/ImageTrack',
    'js/JournalTrack',
    'js/ScrapbookTrack',
    'js/ServiceTrack',
    'js/TagTrack',
    'js/date_utils',
    'hbt!templates/timeline'
], function($, _, handlebars, couchr, d3, store, events, scales, AudioTrack, ImageTrack, JournalTrack, ScrapbookTrack, ServiceTrack, TagTrack, date_utils, timeline_t){
    var exports = {};
    var selector = '.main'
    var options;
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
                }
            ]
        });
    }



    function init_tracks (x, y, width, height, group, emitter, callback) {
        get_tracks(function(err, tracks){
            var objectified = [];

            var chart_details = {
                x : x,
                y : y,
                width : width,
                height : height,
                group : group,
                emitter : emitter
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

        var x = d3.time.scale()
            .domain([scale_info.left_date, scale_info.right_date])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, height])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(-height);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(0)
            .tickSize(-width);

        var x_zoom = d3.behavior.zoom();

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(x_zoom.x(x).scaleExtent(scale_info.scale_extent).on("zoom", zoom));

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

        var track_space =  svg.append("g")
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




        var scrubber_date;
        var update_url_hash = function(){
            if (_.isFunction(history.replaceState)) {
                var date = date_utils.stringifyDate(scrubber_date);
                _.defer(function(){
                    store.set('timeline_current', { date : date, duration: duration })
                });

                var duration = scales.getDuration(x.domain());
                history.replaceState({}, date, "#/timeline/" + date + '/' + duration);


            }
        }

        var update_url_hash = _.debounce(update_url_hash, 150);

        function zoom() {

            var range = x.domain();


            track_space.select(".x.axis").call(xAxis);
            track_space.select(".y.axis").call(yAxis);

            scrubber_date = new Date( d3.mean(range, function(d){ return d.getTime()  }));
            update_url_hash();

            track_emitter.emit('zoom', x);
        }


        init_tracks(x, y, width, height, track_space, track_emitter, function(err, tracks){
           draw_tracks(tracks);
        });




        function redrawToDates(scale_info) {
            x.domain([scale_info.left_date, scale_info.right_date]);
            zoom();
            x_zoom.x(x);//.scaleExtent(scale_info.scale_extent);
        }





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



    return exports;
})