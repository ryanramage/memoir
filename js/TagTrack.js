/**
 * User: ryan
 * Date: 12-10-08
 * Time: 4:29 PM
 */
define(['js/track', 'Class', 'jquery', 'underscore', 'couchr'], function (Track, Class, $, _, couchr) {
    var TagTrack = Class.design('TagTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            TagTrack.Super.call(this, settings, chart_details);
            var me = this;


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
                    by_id[row.id] = i;
                    if (row.value.t) {
                        by_id[row.id].t = row.value.t;
                    }
                });
                var data = _.values(by_id);


                var rect = me.space.selectAll("rect")
                    .data(data,  function(d) { return d.id; });

                //enter
                rect.enter()
                    .append("rect")
                        .attr("class", "tag")
                        .attr("x", function(d) {  return me.x(d.start); })
                        .attr("y", me.settings.y + 1)
                        .attr("height",me.settings.height - 1)
                        .attr("width", function(d) {
                            var w = me.x(d.end) - me.x(d.start);
                            if (w < 1) w = 1;
                            return w;
                        })
                        .attr("fill", "#FBB829")
                        .on('click', function(d,i){
                            $(this).addClass('hover');
                            me.chart_details.emitter.emit('goto', d.start);
                        })
                        .on('mouseover', function(d,i){ $(this).addClass('hover');      })
                        .on('mouseout', function(d,i){  $(this).removeClass('hover');   });


                //update
                rect.attr("x", function(d) { return me.x(d.start); })
                    .attr("width", function(d) {
                        var w = me.x(d.end) - me.x(d.start);
                        if (w < 1) w = 1;
                        return w;
                    });

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
                    end: new Date(tag.timestamp + tag.length)
                }]

                var rect = me.space.selectAll("rect")
                    .data(data, function(d) { return d.id; });

                rect.enter().append("rect")
                    .attr("class", "tag")
                    .attr("x", function(d) {  return me.x(d.start); })
                    .attr("y", me.settings.y + 1)
                    .attr("height",me.settings.height - 1)
                    .attr("width", function(d) {
                        var w = me.x(d.end) - me.x(d.start);
                        if (w < 1) w = 1;
                        return w;
                    })
                    .attr("fill", "#FBB829")
                    .on('click', function(d,i){
                        $(this).addClass('hover');
                        me.chart_details.emitter.emit('goto', d.start);
                    })
                    .on('mouseover', function(d,i){ console.log('over'); $(this).addClass('hover');      })
                    .on('mouseout', function(d,i){  console.log('out');  $(this).removeClass('hover');   });

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
            me.space.selectAll("rect")
                .attr("x", function(d) {  return me.x(d.start); })
                .attr("width", function(d) {
                    var w = me.x(d.end) - me.x(d.start);
                    if (w < 1) w = 1;
                    return w;
                });
            if (!quick) me.drawEntriesDebounced();
        }

    });
    return TagTrack;
});