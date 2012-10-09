/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:49 AM
 */
define('js/AudioTrack', ['js/Track', 'Class'], function (Track, Class) {
    var AudioTrack = Class.design('AudioTrack', {
        Extends: Track,
        initialize : function(settings, x, y, group, emitter){
            AudioTrack.Super.call(this, settings, x, y, group, emitter);
        },
        draw: function() {
            AudioTrack.Super.prototype.draw.call(this);
            this.space = this.group.append("g").attr("clip-path", "url(#clip)");
        },
        zoom: function(x_domain) {
            AudioTrack.Super.prototype.zoom.call(this, x_domain);
            var me = this;
        }
    })
    return AudioTrack;
});