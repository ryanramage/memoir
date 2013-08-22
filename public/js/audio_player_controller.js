define(['jquery', 'underscore', 'couchr', 'events'], function($, _, couchr, events){

	var playlist,
		current_track,
		suggested_time,
		timer,
		exports = {},
        $player = $('#player1'),
        $play_btn = $('.play_btn'),
        state = 'unloaded',
        button_on = false,
        player = $player[0],
        emitter = new events.EventEmitter();


    $play_btn.on('click', function(){
        if (!$play_btn.hasClass('active')) {
            button_on = true;
            exports.play();
        } else {
            button_on = false;
            suggested_time = new Date(current_track.key + (player.currentTime * 1000));
            exports.pause();
        }
    });


    $player.on("timeupdate", function(details){
        throttled_update();
    }).on("ended", function() {
        emitter.emit('ended');
        state = 'ended';
    }).on("waiting", function(){
        emitter.emit('waiting');
    }).on("playing", function() {
        emitter.emit('playing');
    }).on("seeking", function() {

        emitter.emit('seeking');
    }).on("loadstart", function() {
        emitter.emit('loadstart');
    });

    exports.get_emitter = function() {
        return emitter;
    };


	exports.get_playlist = function(starttime, endtime, scale, callback) {
        var startkey = starttime - (11*60*1000); // get 11 min earlier


        // TODO - depending on scale, should limit the amount of data coming back
        var query = {
            startkey : startkey,
            endkey : endtime,
            include_docs : false
        };
        couchr.get('_ddoc/_view/audio_by_time', query, callback );
	};


	exports.cache_playlist = function(details) {
        if (details.playlist) playlist = details.playlist;
        if (details.current_track) current_track = details.current_track;
        if (details.centre_time) suggested_time = details.centre_time;
	};

	function _update() {
		if (state != 'playing' || !button_on) return;
		if (player.currentTime === 0) return;
		var play_date = new Date(current_track.key + (player.currentTime * 1000));
		var update = {
			time: player.currentTime,
			date: play_date
		};

		emitter.emit('progress', update);

	}

	var throttled_update = _.throttle(_update, 500);


	function _play() {
		if (!timer) timer = setInterval(_update, 500);
		state = 'playing';
	}

	function find_track_in_playlist(centre_time) {
        if (!playlist || !playlist.rows) return [];

		return _.find(playlist.rows, function(d) {
            if ((d.value.start <= centre_time) && (centre_time <= d.value.end)) return true;
            else return false;
		});
	}


    exports.pause = function() {
        player.pause();
    };

	exports.play = function(date) {
        if (!button_on) return;
		if (!date) date = new Date(suggested_time);

		//player.pause();
		current_track = find_track_in_playlist(date.getTime());
		if (!current_track || !current_track.value) return;

        var media = _.keys(current_track.value.file)[0];
        var seekTime = (date - current_track.key) / 1000;

        player.src = ['_db', current_track.id, media ].join('/');
        $player
            .on('loadedmetadata', function(){
                this.play();
                player.currentTime = seekTime;
            });
        player.load();
        _play();
	};

	exports.seeking = function() {
		state = 'seeking';
	};

	return exports;

});