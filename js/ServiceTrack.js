/**
 * User: ryan
 * Date: 12-10-08
 * Time: 11:50 AM
 */
define('js/ServiceTrack', ['js/Track', 'Class'], function (Track, Class) {
    var ServiceTrack =  Class.design('ServiceTrack', {
        Extends: Track
    })
    return ServiceTrack;
});