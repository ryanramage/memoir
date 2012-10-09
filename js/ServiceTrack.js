/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:50 AM
 */
define('js/ServiceTrack', ['js/Track', 'Class', 'jquery','couchr', 'js/scales'], function (Track, Class, $, couchr, scales) {
    var ServiceTrack =  Class.design('ServiceTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            ServiceTrack.Super.call(this, settings, chart_details);
            var me = this;

            me.getEntries = function(callback) {
                var domain = me.chart_details.x.domain();
                var query = {
                    startkey : [settings.service_name, domain[0].getTime()],
                    endkey : [settings.service_name, domain[1].getTime()],
                    include_docs : true
                }
                couchr.get('_ddoc/_view/service_by_service_and_date', query, me.drawEntries )
            }

            me.drawEntries = function(err, results) {
                me.space.selectAll("rect")
                           .data(results.rows)
                           .enter().append("rect")
                           .attr("class", "tag")
                               .attr("x", function(d) { return me.x(new Date(d.doc.timestamp)); })
                               .attr("y", me.settings.y + 1)
                               .attr("height",me.settings.height - 1)
                               .attr("width", "2")
                               .attr("fill", "#2d578b")
            }

        },
        draw: function() {
            ServiceTrack.Super.prototype.draw.call(this);
            this.space = this.chart_details.group.append("g").attr("clip-path", "url(#clip)");

            // add a div to the right of this
            this.icon = $('<div class="lifestream-' + this.settings.service_name + ' timeline-service-icon"></div>');

            this.icon.css('top', this.settings.y + 'px');
            this.icon.appendTo(this.chart_details.$gutter);
            this.getEntries(function(err, results){
                console.log(results);
            })

        },
        zoom: function(x_domain) {
            ServiceTrack.Super.prototype.zoom.call(this, x_domain);
            var me = this;
            me.space.selectAll("rect").attr("x", function(d) { return me.x(new Date(d.doc.timestamp)); });

        }
    })
    return ServiceTrack;
});