/**
 * User: ryan
 * Date: 12-10-08
 * Time: 4:26 PM
 */
define('js/ImageTrack', ['js/Track', 'Class'], function (Track, Class) {


    var ImageTrack =  Class.design('ImageTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            ImageTrack.Super.call(this, settings, chart_details);
            this.images = [
                {
                    start: new Date(2011, 1,1), end: new Date(2011,1,2),
                    url: 'http://svg-edit.googlecode.com/svn/branches/2.5.1/editor/images/logo.png',
                    width: 37, height: 59
                }
            ]
        },
        draw: function() {
            ImageTrack.Super.prototype.draw.call(this);
            this.space = this.group.append("g").attr("clip-path", "url(#clip)");
            var me = this;
            this.space.selectAll('image')
                    .data(this.images)
                    .enter().append('image')
                    .attr('class', 'scrap')
                    .attr('x', function(d) {  return me.x(d.start); })
                    .attr('y', me.settings.y + 1)
                    .attr('width', function(d) {
                                var date_width =  me.x(d.end) - me.x(d.start);
                                var img_width = d.width;
                                if(img_width < date_width) return img_width;
                                return date_width;
                    })
                    .attr('height', function(d) {return d.height })
                    .attr('xlink:href', function(d) {return d.url})
        },
        zoom: function(x_domain, quick) {
            ImageTrack.Super.prototype.zoom.call(this, x_domain);
            var me = this;
            me.space.selectAll('image')
                .attr("x", function(d) {  return me.x(d.start); })
                .attr("width", function(d) {
                            var date_width =  me.x(d.end) - me.x(d.start);
                            var img_width = d.width;
                            if(img_width < date_width) return img_width;
                            return date_width;
                 });
        }
    })
    return ImageTrack;
});