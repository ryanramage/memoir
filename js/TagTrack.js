/**
 * User: ryan
 * Date: 12-10-08
 * Time: 4:29 PM
 */
define('js/TagTrack', ['js/Track', 'Class', 'jquery'], function (Track, Class, $) {
    var TagTrack = Class.design('TagTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            TagTrack.Super.call(this, settings, chart_details);
            this.data = [
                { start: new Date(2011, 1,1), end: new Date(2011,1,2)},
                { start: new Date(2011, 1,3), end: new Date(2011,1,4)}
            ];
        },


        draw: function() {
            TagTrack.Super.prototype.draw.call(this);
            this.space = this.group.append("g").attr("clip-path", "url(#clip)");
            var me = this;
            this.space.selectAll("rect")
            .data(this.data)
            .enter().append("rect")
            .attr("class", "tag")
                .attr("x", function(d) {  return me.x(d.start); })
                .attr("y", me.settings.y + 1)
                .attr("height",me.settings.height - 1)
                .attr("width", function(d) {  return me.x(d.end) - me.x(d.start); })
                .attr("fill", "#2d578b")
                .on('click', function(d,i){   $(this).addClass('hover');   })
                .on('mouseover', function(d,i){  $(this).addClass('hover');   })
                .on('mouseout', function(d,i){  $(this).removeClass('hover');   });
        },
        zoom: function(x_domain, quick) {
            TagTrack.Super.prototype.zoom.call(this, x_domain, quick);
            var me = this;
            me.space.selectAll("rect").attr("x", function(d) {  return me.x(d.start); }).attr("width", function(d) {  return me.x(d.end) - me.x(d.start); });
        }

    });
    return TagTrack;
});