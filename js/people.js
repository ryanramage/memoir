define([
    'jquery',
    'underscore',
    'couchr',
    'async',
    'moment',
    'json.edit',
    'js/date_utils',
    'hbt!templates/people_all',
    'hbt!templates/people_details',
    'hbt!templates/people_interactions',
    'hbt!templates/people_form'
    ], function($, _, couchr, async, moment, JsonEdit, date_utils, all_t, details_t, interactions_t, form_t){
    var exports = {};

    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };


    function list() {
        options.emitter.emit('section', 'people');
        couchr.get('_ddoc/_view/people_by_interaction', {reduce: true, group_level: 1}, function(err, results){
            $(selector).html(all_t(results.rows));
        });

    }

    function viewDetails(name) {
        showNav(name, 'details');

        var person_id = 'person-' + name,
            editor;

        async.parallel({
            schema: function(cb) {
                couchr.get('_ddoc/_show/person_schema', cb);
            },
            person: function(cb) {
                couchr.get('_db/' + person_id, function(err, person){
                    if (err && err.status === 404) return cb(null);
                    return cb(err, person);
                });
            }
        }, function(err, results){
            $(selector).find('.person-content').html(form_t());
            editor = JsonEdit('app_settings_schema', results.schema[0]);
        });
    }

    function viewInteractions(name) {
        showNav(name, 'interactions');
        couchr.get('_ddoc/_view/people_by_interaction', {reduce: false, start_key: [name], end_key: [name, {}] }, function(err, results){
            var insteractions = _.map(results.rows, toInteraction );
            $(selector).find('.person-content').html(interactions_t(insteractions));

        });
    }

    function toInteraction(row) {
        var date = moment(row.key[1]);
        return {
            time_link: time_link(date),
            subject_link: subject_link(row),
            subject_description: subject_description(row),
            date_str: date.fromNow(),
            date_read: date.format('LLLL'),
            type: row.value.type
        };
    }


    function subject_link(row) {
        if (row.value.type === 'journal') return '#/journal/' + row.id;
    }

    function subject_description(row) {
        if (row.value.type === 'journal') return 'referenced in journal';
    }

    function time_link(date) {
        return '#/timeline/' + date_utils.stringifyDate(date);
    }


    function showNav(name, active) {
        options.emitter.emit('section', 'people');
        $(selector).html(details_t({name: name}));
        $(selector).find('.nav-tabs').removeClass('active');
        $(selector).find('.' + active).addClass('active');
    }


    exports.routes = function() {
       return  {
            '/people' : list,
            '/person/*/interactions' : viewInteractions,
            '/person/*': viewDetails

        };
    };
    return exports;

});