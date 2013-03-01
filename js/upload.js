define([
    'jquery',
    'hbt!templates/upload_wizard',
    'hbt!templates/upload_audio'
], function($, wizard_t, audio_t){

    var exports = {};

    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };

    function audio() {

    }

    function wizard() {
        $(selector).html(wizard_t());

        $('#fileUploader').on('change', function() { handleFiles(this.files); }   );
        function handleFiles(files) {
            if (!files.length) return;

            for (var i = 0; i < files.length; i++) {
                processFile(files[i]);
            }
        }
    }


    function processFile(file) {
        var audio = new Audio();
        audio.src = window.URL.createObjectURL(file);
        audio.preload = 'auto';
        var listener = function() {
          var duration = audio.duration;
          // clean up
          audio.removeEventListener('canplaythrough', listener, false);
          window.URL.revokeObjectURL(audio.src);
        };
        audio.addEventListener('canplaythrough', listener, false);
        audio.load();


    }


    exports.routes = function() {
       return  {
            '/upload/audio': audio,
            '/upload' : wizard
        };
    };


    return exports;
});