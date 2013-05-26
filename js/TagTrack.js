/**
 * User: ryan
 * Date: 12-10-08
 * Time: 4:29 PM
 */
define(['js/track', 'Class', 'jquery', 'underscore', 'couchr', 'd3'], function (Track, Class, $, _, couchr, d3) {
    var TagTrack = Class.design('TagTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            TagTrack.Super.call(this, settings, chart_details);
            var me = this;


            var drag = d3.behavior.drag()
                .on("drag", function(d,i) {
                    var newTime = me.x.invert(d3.event.x);
                    if ($(this).attr('class') === 'r-resize') {
                        d.end = newTime;
                    } else {
                        d.start = newTime;
                    }
                    me.space.selectAll("text")
                        .attr("x", function(d) {  return me.x(d.start); })
                        .text(function(d) { return d.t; });

                    me.space.selectAll("rect.tag")
                        .attr("x", function(d) {  return me.x(d.start); })
                        .attr("width", function(d) {
                            var w = me.x(d.end) - me.x(d.start);
                            if (w < 1) w = 1;
                            return w;
                        });


                    me.space.selectAll("rect.r-resize")
                        .attr("x", function(d) {  return me.x(d.end) - 2; })
                        .attr("width", function(d) {
                            var w = 2;
                            var l = me.x(d.end) - me.x(d.start);
                            if (l < 5) w = 0;
                            return w;
                        });

                    me.space.selectAll("rect.l-resize")
                        .attr("x", function(d) {  return me.x(d.start); })
                        .attr("width", function(d) {
                            var w = 2;
                            var l = me.x(d.end) - me.x(d.start);
                            if (l < 5) w = 0;
                            return w;
                        });
                })
                .on("dragend", function(d, i){
                    // update the tag
                    couchr.put('_ddoc/_update/tag_dates/' + d.id, {
                        timestamp: d.start.getTime(),
                        duration : d.end.getTime() - d.start.getTime()
                    }, function(err, resp){
                        if (err) return alert('could not save ' + err);
                    });
                });



            me.getEntries = function(callback) {
                var domain = me.chart_details.x.domain();

                // TODO - depending on scale, should limit the amount of data coming back
                var query = {
                    startkey : domain[0].getTime(),
                    endkey :   domain[1].getTime()                };
                couchr.get('_ddoc/_view/tags_by_time', query, callback );
            };

            me.drawEntries = function(err, results) {


                // results can contain 1-2 records per tag (start & end)
                // collapse this by id
                var by_id = {};
                _.each(results.rows, function(row){
                    var i = {
                        id: row.id,
                        start: new Date(row.key),
                        end: new Date(row.key + row.value.ms)
                    };
                    if (row.value.p === 1) { // its an end node
                        i.start = new Date(row.key - row.value.ms);
                        i.end = new Date(row.key);
                    }
                    if (row.value.t) {
                        i.t = row.value.t;
                    }
                    else if (by_id[row.id] && by_id[row.id].t) {
                        i.t = by_id[row.id].t
                    }
                    by_id[row.id] = i;

                });
                var data = _.values(by_id);




                var rect = me.space.selectAll("g")
                    .data(data,  function(d) { return d.id; });

                //enter
                var g = rect.enter().append("g");
                    g.append('rect')
                        .attr("class", "tag")
                        .attr("x", function(d) {  return me.x(d.start) + 2; })
                        .attr("y", me.settings.y + 14)
                        .attr("height", 12)
                        .attr("width", function(d) {
                            var w = me.x(d.end) - me.x(d.start) - 2;
                            if (w < 1) w = 1;
                            return w;
                        })
                        .attr("fill", "#FBB829")
                        .on('click', function(d,i){
                            $(this).addClass('hover');
                            me.chart_details.emitter.emit('goto', d.start);
                        });



                        // left resizer
                        g.append('rect')
                            .attr("class", "l-resize")
                            .attr("x", function(d) {  return me.x(d.start); })
                            .attr("y", me.settings.y + 14)
                            .attr("height", 12)
                            .attr("width", function(d) {
                                var w = 2;
                                var l = me.x(d.end) - me.x(d.start);
                                if (l < 5) w = 0;
                                return w;
                            })
                            .call(drag);

                        // right resizer
                        g.append('rect')
                            .attr("class", "r-resize")
                            .attr("x", function(d) {  return me.x(d.end) - 2; })
                            .attr("y", me.settings.y + 14)
                            .attr("height", 12)
                            .attr("width", function(d) {
                                var w = 2;
                                var l = me.x(d.end) - me.x(d.start);
                                if (l < 5) w = 0;
                                return w;
                            })
                            .call(drag);



                    g.append('text')
                        .attr("x", function(d) {  return me.x(d.start); })
                        .attr("y", me.settings.y + 12)
                        .text(function(d) { return d.t; });

                //update


                // delete
                rect.exit()
                    .remove();
            };

            me.drawEntriesDebounced = _.debounce(function(){
                me.getEntries(me.drawEntries);
            }, 1000);


            // someone added a tag
            me.chart_details.emitter.on('tag-added', function(tag){

                var data = [{
                    id: tag._id,
                    start: new Date(tag.timestamp),
                    end: new Date(tag.timestamp + tag.length),
                    t: tag.text
                }]

                var rect = me.space.selectAll("rect")
                    .data(data, function(d) { return d.id; });


                //enter
                var g = rect.enter().append("g");
                    g.append('rect')
                        .attr("class", "tag")
                        .attr("x", function(d) {  return me.x(d.start) + 2; })
                        .attr("y", me.settings.y + 14)
                        .attr("height", 12)
                        .attr("width", function(d) {
                            var w = me.x(d.end) - me.x(d.start) - 2;
                            if (w < 1) w = 1;
                            return w;
                        })
                        .attr("fill", "#FBB829")
                        .on('click', function(d,i){
                            $(this).addClass('hover');
                            me.chart_details.emitter.emit('goto', d.start);
                        });



                        // left resizer
                        g.append('rect')
                            .attr("class", "l-resize")
                            .attr("x", function(d) {  return me.x(d.start); })
                            .attr("y", me.settings.y + 14)
                            .attr("height", 12)
                            .attr("width", function(d) {
                                var w = 2;
                                var l = me.x(d.end) - me.x(d.start);
                                if (l < 5) w = 0;
                                return w;
                            })
                            .call(drag);

                        // right resizer
                        g.append('rect')
                            .attr("class", "r-resize")
                            .attr("x", function(d) {  return me.x(d.end) - 2; })
                            .attr("y", me.settings.y + 14)
                            .attr("height", 12)
                            .attr("width", function(d) {
                                var w = 2;
                                var l = me.x(d.end) - me.x(d.start);
                                if (l < 5) w = 0;
                                return w;
                            })
                            .call(drag);



                    g.append('text')
                        .attr("x", function(d) {  return me.x(d.start); })
                        .attr("y", me.settings.y + 12)
                        .text(function(d) { return d.t; });
            });


        },


        draw: function() {
            TagTrack.Super.prototype.draw.call(this);
            this.space = this.group.append("g").attr("clip-path", "url(#clip)");
            this.getEntries(this.drawEntries);


        },
        zoom: function(x_domain, quick) {
            TagTrack.Super.prototype.zoom.call(this, x_domain, quick);
            var me = this;
            me.space.selectAll("text")
                .attr("x", function(d) {  return me.x(d.start); })
                .text(function(d) { return d.t; });

            me.space.selectAll("rect.tag")
                .attr("x", function(d) {  return me.x(d.start); })
                .attr("width", function(d) {
                    var w = me.x(d.end) - me.x(d.start);
                    if (w < 1) w = 1;
                    return w;
                });


            me.space.selectAll("rect.r-resize")
                .attr("x", function(d) {  return me.x(d.end) - 2; })
                .attr("width", function(d) {
                    var w = 2;
                    var l = me.x(d.end) - me.x(d.start);
                    if (l < 5) w = 0;
                    return w;
                });

            me.space.selectAll("rect.l-resize")
                .attr("x", function(d) {  return me.x(d.start); })
                .attr("width", function(d) {
                    var w = 2;
                    var l = me.x(d.end) - me.x(d.start);
                    if (l < 5) w = 0;
                    return w;
                });

            if (!quick) me.drawEntriesDebounced();
        }

    });
    return TagTrack;
});