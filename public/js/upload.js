define([
    'jquery',
    'underscore',
    'async',
    'moment',
    'couchr',
    'js/recording_with_interval',
    'js/hash_file',
    'js/sansa_clip_recorder',
    'hbt!templates/upload_wizard',
    'hbt!templates/upload_audio',
    'hbt!templates/upload_confirm'
], function($, _, async, moment, couchr, Recording, hash_file, sansa, wizard_t, audio_t, upload_confirm_t){

    var exports = {};

    var selector = '.main';
    var options;

    var progressTotal = 0;
    var progress = 0;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };

    function audio() {
        options.emitter.emit('section', 'upload');
        $(selector).html(audio_t());

        $('#fileUploader').on('change', function() { handleFiles(this.files); }   );
        function handleFiles(files) {
            if (!files.length) return;

            progressTotal = files.length;
            $('.processing_status').show();

            async.mapLimit(files, 2, processFileDelay, function(err, results){

                var recordings = _.groupBy(results, function(recording){
                    if(recording.getError()) return 'error';
                    else return 'ok';
                });

                findMarks(recordings.ok, function(err, marks) {
                    confirm_upload({recordings: recordings, marks: marks});
                });
            });
        }
    }

    function wizard() {
        options.emitter.emit('section', 'upload');
        $(selector).html(wizard_t());
    }

    function confirm_upload(details) {

        $('.processing_status').hide();

        var audio_duration = 0;
        var first_date = null;
        _.each(details.recordings.ok, function(recording){
            audio_duration += recording.duration;
            if (!first_date) first_date = recording.start_date;
            if (recording.start_date.valueOf() < first_date.valueOf()) first_date = recording.start_date;
        });
        details.audio_duration = audio_duration;
        details.first_date = first_date;

        details.audio_duration_str = moment.duration(Math.round(audio_duration), 'seconds').humanize();

        $('.upload_confirm').html(upload_confirm_t(details));
        $('button.finish').on('click', function(){
            $(this).hide();

            $('.processing_status .bar').css('width', '0%');
            $('.processing_status').show();
            $('.processing_status h4').text('Uploading Files');
            finish_upload(details);
        });
    }


    function finish_upload(details) {
        progress = 0;
        progressTotal = (details.recordings.ok.length * 2); // 1 for doc, 1 for attach

        async.eachLimit(details.recordings.ok, 2, upload_to_couch, function(err){
            $('.upload_finished').show();
            $('.processing_status').hide();

            var first_date_link = '#/timeline/' + details.first_date.format('YYYY-MM-DDTHH:mm:ss');
            $('a.first_date_link').attr('href', first_date_link);

        });
    }

    function upload_to_couch(recording, callback) {
        var hash = new hash_file(recording.file, function(hash){

            var doc = {
                _id : hash,
                liferecorder: true,
                recording: {
                    start: recording.start_date.valueOf(),
                    length: recording.duration
                }
            };
            couchr.post('_db', doc, function(err, resp){
                updateProgress();
                if (err && err.error && err.error === 'conflict') {
                    recording.already_loaded = true;
                    return callback(null, recording);
                }
                if (err) return callback(err);

                post_attachment(recording, doc, resp.rev, callback);
            });

        });
    }


    function post_attachment(recording, doc, rev, callback) {
        var address =['_db', doc._id, recording.file.name, '?rev=' + rev].join('/');
        var xhr = new XMLHttpRequest();
        //xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", function()  { updateProgress(); callback(null);     }, false);
        xhr.addEventListener("error", function() { updateProgress(); callback('failed'); }, false);
        xhr.addEventListener("abort", function() { updateProgress(); callback('failed'); }, false);
        xhr.open("PUT", address);
        xhr.send(recording.file);
    }


    function findMarks(recordings, callback) {
        var marks = sansa.findMarks(recordings);
        callback(null, marks);
    }


    // give some breathing room to the browser
    function processFileDelay(file, callback) {
        setTimeout(function(){
            processFile(file, callback);
        }, 300);
    }


    function processFile(file, callback) {


        var date = findAudioDate(file.name, file.lastModifiedDate);


        var audio = new Audio();
        audio.src = window.URL.createObjectURL(file);
        audio.preload = 'auto';
        var completed = false;
        var listener = function() {
          var duration = audio.duration;
          // clean up
          audio.removeEventListener('canplaythrough', listener, false);
          window.URL.revokeObjectURL(audio.src);
          audio = undefined;
          var rwi = new Recording(file, date, duration);
          if (!completed)  updateProgress(rwi, callback);
          completed = true;
        };
        audio.addEventListener('canplaythrough', listener, false);
        audio.load();

        //
        setTimeout(function(){
            if (!completed) {
                completed = true;
                var rwi = new Recording(file, date);
                rwi.setError(true);
                updateProgress(rwi, callback);
            }
        }, 5000);

    }

    function updateProgress(data, callback) {
        progress++;
        var width = (progress / progressTotal) * 100;
        $('.processing_status .bar').css('width', width + '%');

        if (callback) callback(null, data);
    }


    function findAudioDate(str, modifiedDate) {
        str = str.replace('R_MIC_', '');
        str = str.replace('.mp3', '');
        return moment(str, "YYMMDD-HHmmss");
    }


    exports.routes = function() {
       return  {
            '/upload/audio': audio,
            '/upload' : wizard
        };
    };


    return exports;
});