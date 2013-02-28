define(['jquery', 'underscore', 'couchr', 'async', 'json.edit', 'hbt!templates/settings'], function($, _, couchr, async, JsonEdit, settings_t){
    var exports = {};

    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };

    function settings() {
        options.emitter.emit('section', 'settings');
        var editor, last_app_settings;

        $(selector).html(settings_t());

        couchr.get('./_ddoc/_show/app_config', function(err, schema) {

            couchr.get('./_ddoc/_show/app_settings/app_settings', function(err, app_settings){
                last_app_settings = app_settings;

                if (app_settings) {
                    schema['default'] = app_settings;
                }


                editor = JsonEdit('app_settings_schema', schema);
            });
        });

       $('form').on('submit', function(){
            try {
                var btn = $('button.save');
                btn.button('saving');
                var err_alert = $('.alert');
                err_alert.hide(10);

                var form = editor.collect();
                if (!form.result.ok) {

                   err_alert.show(200)
                       .find('button.close')
                       .on('click', function () { err_alert.hide(); });
                   err_alert.find('h4')
                        .text(form.result.msg);
                   return false;
                }


                var app_settings = _.extend(last_app_settings, form.data);
                couchr.put('./_db/app_settings', app_settings, function(err, resp){
                    console.log(err, resp);
                });




            } catch(e) { console.log(e); }
           return false;
       });


    }



    exports.routes = function() {
       return  {
            '/settings' : settings
        };
    };

    return exports;

});