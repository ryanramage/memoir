(function(){


    var currentETag;

    var fetchStatus = function(callback) {

        var client = new XMLHttpRequest();
        client.onreadystatechange = function() {
        // in case of network errors this might not give reliable results
        if(this.readyState == this.DONE)
          callback(null, client.getResponseHeader('ETag').toString());
        }
        client.open("HEAD", '_ddoc');
        client.send();
    }

    var checkToReload = function() {
        fetchStatus(function(err, etag){
            if (!currentETag) currentETag = etag;
            else {
                if (currentETag !== etag) {
                    window.location.reload();
                }
            }
        });
    }


    var pageLoaded = function() {
        console.log('starting live reload');
        setInterval(checkToReload, 1500);
    }


    if (document.addEventListener) {
        //Standards. Hooray! Assumption here that if standards based,
        //it knows about DOMContentLoaded.
        document.addEventListener("DOMContentLoaded", pageLoaded, false);
        window.addEventListener("load", pageLoaded, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", pageLoaded);

        testDiv = document.createElement('div');
        try {
            isTop = window.frameElement === null;
        } catch (e) {}

        //DOMContentLoaded approximation that uses a doScroll, as found by
        //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
        //but modified by other contributors, including jdalton
        if (testDiv.doScroll && isTop && window.external) {
            scrollIntervalId = setInterval(function () {
                try {
                    testDiv.doScroll();
                    pageLoaded();
                } catch (e) {}
            }, 30);
        }
    }



})();