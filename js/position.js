define(function(){
    var updateLocation = null;
    var currentPosition = null;
    var callbackFail = null;

    return  {
        init : function(cb) {
            updateLocation = navigator.geolocation.watchPosition(
                function(position) {
                    cb(null, position);
                }, function(err){
                    cb(err);
                }, {enableHighAccuracy: true});
        },
        stop: function() {
            navigator.geolocation.clearWatch(updateLocation);
        },
        getLastPosition : function() {
            return currentPosition;
        }
    };
});
