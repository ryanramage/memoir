/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:50 AM
 */
define([
    'js/track',
    'Class',
    'jquery',
    'couchr',
    'underscore',
    'js/scales'
],

function (Track, Class, $, couchr, _, scales) {
    var ServiceTrack =  Class.design('ServiceTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            ServiceTrack.Super.call(this, settings, chart_details);
            var me = this;

            me.getEntries = function(callback) {
                var domain = me.chart_details.x.domain();


                // TODO - depending on scale, should limit the amount of data coming back
                var query = {
                    startkey : [settings.service_name, settings.service_user, domain[0].getTime()],
                    endkey : [settings.service_name, settings.service_user, domain[1].getTime()],
                    include_docs : true
                };
                couchr.get('_ddoc/_view/service_by_service_and_date', query, callback );
            };

            me.drawEntries = function(err, results) {
                var rect = me.space.selectAll("rect")
                    .data(results.rows,  function(d) { return d.id; });

                //enter
                rect.enter().append("rect")
                    .attr("class", "service-tag")
                    .attr("x", function(d) { return me.x(new Date(d.doc.timestamp)); })
                    .attr("y", me.settings.y + 1)
                    .attr("height",me.settings.height - 1)
                    .attr("width", "4")
                    .attr("fill", "#2d578b");


                //update
                rect.attr("x", function(d) { return me.x(new Date(d.doc.timestamp)); });

                // delete
                rect.exit()
                    .remove();


                $('svg rect.service-tag').popover({
                    placement: 'bottom',
                    trigger : 'hover',
                    delay: { show: 500, hide: 2000 },
                    title : function() {
                        return '<span class="lifestream-' + me.settings.service_name + ' timeline-service-popup-icon"></span>' + this.__data__.doc.config.user;
                    },
                    content : function(){
                        return  this.__data__.doc.html;
                    }
                });

            };

            me.drawEntriesDebounced = _.debounce(function(){
                me.getEntries(me.drawEntries);
            }, 1200);

        },
        draw: function() {
            ServiceTrack.Super.prototype.draw.call(this);
            this.space = this.chart_details.group.append("g").attr("clip-path", "url(#clip)");

            // add a div to the right of this
            this.icon = $('<div class="lifestream-' + this.settings.service_name + ' timeline-service-icon"></div>');

            this.icon.css('top', this.settings.y + 'px');
            this.icon.appendTo(this.chart_details.$gutter);
            this.getEntries(this.drawEntries);

        },
        zoom: function(x_domain, quick) {
            ServiceTrack.Super.prototype.zoom.call(this, x_domain);
            var me = this;
            me.space.selectAll("rect").attr("x", function(d) { return me.x(new Date(d.doc.timestamp)); });
            if (!quick) me.drawEntriesDebounced();
        }
    });
    return ServiceTrack;
});