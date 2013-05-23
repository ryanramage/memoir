/**
 * User: ryan
 * Date: 12-10-08
 * Time: 4:30 PM
 */
define(['js/track', 'Class'], function (Track, Class) {
    var JournalTrack =  Class.design('JournalTrack', {
        Extends: Track
    });
    return JournalTrack;
});