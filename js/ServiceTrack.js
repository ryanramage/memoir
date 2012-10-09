/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:50 AM
 */
define('js/ServiceTrack', ['js/Track', 'Class', 'jquery'], function (Track, Class, $) {
    var ServiceTrack =  Class.design('ServiceTrack', {
        Extends: Track,
        initialize : function(settings, chart_details){
            ServiceTrack.Super.call(this, settings, chart_details);

        },
        draw: function() {
            ServiceTrack.Super.prototype.draw.call(this);
            this.space = this.group.append("g").attr("clip-path", "url(#clip)");

            // add a div to the right of this
            this.icon = $('<div class="lifestream-' + this.settings.service_name + ' timeline-service-icon"></div>');

            this.icon.css('top', this.settings.y + 'px');
            this.icon.appendTo(this.chart_details.$gutter);


        },
        zoom: function(x_domain) {
            ServiceTrack.Super.prototype.zoom.call(this, x_domain);

        }
    })
    return ServiceTrack;
});