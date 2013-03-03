define('js/quick', [
    'jquery',
    'underscore',
    'async',
    'handlebars',
    'couchr',
    'bird-down',
    'js/reference',
    'EpicEditor',
    'moment',
    'jquery-lifestream',
    'spin-js',
    'hbt!templates/quick',
    'hbt!templates/quick_tag',
    'hbt!templates/quick_people',
    'hbt!templates/quick_people_row',
    'hbt!templates/quick_journal',
    'hbt!templates/quick_lifestream'
], function ($, _, async, handlebars, couchr, birddown, reference, EpicEditor, moment, lifestream, Spinner, base_t, tag_t, people_t, people_row_t, journal_t, lifestream_t) {

    var exports = {};
    var selector = '.main';
    var options;

    exports.init = function (opts) {
        options = opts;
        selector = opts.selector;
    };


    exports.tag = function () {
        showNav('tag');
        $(selector).find('.quick_form').html(tag_t());
    };


    function addPerson(name) {
        // split
        // get valid name
        var person = {
            name : name,
            handle : name
        };

        $(selector).find('.table.name').show();
        $(selector).find('.table.name tbody').append(people_row_t(person));

    }


    exports.people = function () {
        showNav('people');
        $(selector).find('.quick_form').html(people_t());
        var $person_entry = $(selector).find('input[name="person_entry"]');

        $(selector).find('form').on('submit', function(){
            addPerson($person_entry.val());
            return false;
        });


        var eventName = "onwebkitspeechchange" in $person_entry.get(0) ? "webkitspeechchange" : "speechchange";
        $person_entry.on(eventName, function(){
           addPerson($person_entry.val());
           $person_entry.val('');
        });
    };


   function cite($btn, editor) {
       var text = $btn.data('text');
       var index = $btn.data('index');

       // see http://epiceditor-demos.herokuapp.com/
       var doc = editor.editorIframeDocument;
       var selection = editor.editorIframeDocument.getSelection();
       //console.log(selection);
       if (selection.rangeCount === 0) {
           return;
       }
       var range = selection.getRangeAt(0);

       var noTextSelected = (range.endOffset === range.startOffset);

       var prefix = '[';
       var postfix = "][" + index + "]";

       if (noTextSelected) {
           prefix += text;
       }

       // add the prefix
       range = selection.getRangeAt(0);
       range.insertNode(document.createTextNode(prefix));
       range.collapse(false);

       // And the postfix
       selection.removeAllRanges();
       selection.addRange(range);
       range.insertNode(document.createTextNode(postfix));
   }

    function markup(editor, prefix, postfix) {
       // see http://epiceditor-demos.herokuapp.com/
       var doc = editor.editorIframeDocument;
       var selection = editor.editorIframeDocument.getSelection();
       //console.log(selection);
       if (selection.rangeCount === 0) {
           return;
       }
       var range = selection.getRangeAt(0);

       var noTextSelected = (range.endOffset === range.startOffset);

       // add the prefix
       range = selection.getRangeAt(0);
       range.insertNode(document.createTextNode(prefix));
       range.collapse(false);

       // And the postfix
       selection.removeAllRanges();
       selection.addRange(range);
       range.insertNode(document.createTextNode(postfix));

       editor.save();
       $('button.save').removeAttr("disabled").removeClass('disabled');
    }



    function ensureJournalFields (doc) {
        if (!doc.type) doc.type = 'journal';
    }


    exports.journal = function () {
        showNav('journal');

        var date_str = moment().format('LL');
        var save_date_str = moment().format("YYYY-MM-DD");
        $(selector).find('.quick_form').html(journal_t({date_str : date_str}));



        var bd = new birddown({
            doublebrackets : true,
            doublebracketsUrlBase : '#/topics/',
            hashtagUrlBase : "#/topics/",
            cashtagUrlBase : "https://twitter.com/#!/search?q=%24",
            usernameUrlBase : "#/person/",
            listUrlBase : "https://twitter.com/"
        });
        var reference_sheet_json;
        var parse = function(str){
            return bd.parse(str  + reference.generateReferenceSheetMarkdown(reference_sheet_json));
        };

        var editor = new EpicEditor({
            parser: parse,
            focusOnLoad : true,
            clientSideStorage: false,
            file: {
                name: save_date_str,
                defaultContent: '',
                autoSave: false
            }
        }).load();


        var timeline_query = {
            startkey: moment().sod().valueOf(),
            endkey: moment().eod().valueOf(),
            include_docs: true
        };

        var journal_query = {
            date : save_date_str
        };


        async.parallel({
            timeline : function(cb) {
                couchr.get('_ddoc/_view/timeline_items', timeline_query, function(err, resp, req){
                    cb(err, resp); // we do this b/c we dont want the req in the data object
                });
            },
            journal : function(cb) {
                couchr.get('_journal/' + save_date_str, function(err, doc){
                    if (err) return cb(null); // no journal found, set null
                    return cb(null,doc);
                });
            }
        }, function(err, data){

            var last_rev = null;
            if (data.journal && data.journal._rev) {
              last_rev = data.journal._rev;
            }

            if (data.journal && data.journal.entry) {
                editor.importFile('epiceditor',data.journal.entry);

            }

            editor.getElement('editor').addEventListener('input', function(){
                // feels dirty, show state.
                $('button.save').removeAttr("disabled").removeClass('disabled');
            });

            var reference_sheet = reference.createReferenceSheet(data);
            reference_sheet_json = reference_sheet.references;
            if (reference_sheet.updated) {
                ensureJournalFields(reference_sheet.doc);
                couchr.put('_journal/' + save_date_str, reference_sheet.doc, function(err, resp){
                    console.log(err, resp);
                });
            }

            $(selector).find('.references').html(reference_sheet.html);
            $('button.cite').on('click',function(){
                cite($(this), editor);
                editor.save();
            });
            $('button.bold').on('click', function(){
                markup(editor, '**', '**');
            });
            $('button.italic').on('click', function(){
                markup(editor, '_', '_');
            });

            $('button.save').on('click', function(){
              $('button.save').button('loading');
              editor.save();
              var doc = {
                _id: save_date_str,
                type: 'journal',
                entry: editor.exportFile()
              };
              if (last_rev) doc._rev = last_rev;
              couchr.put('_db/' + save_date_str, doc, function(err, resp){
                if (err) return alert('File did not save!');
                last_rev = resp.rev;
                resetSaveButton();
              });

            });

        });
    };

    function resetSaveButton() {
      $('button.save').button('reset');
      setTimeout(function(){
          $('button.save').attr('disabled', 'disabled').addClass('disabled');
      }, 200);
    }

    function show_settings_messgage() {
      $('#lifestream').html('No services. Please add them in your <a href="#/settings">settings</a>.');
      $('.load-status').html('');
    }


    exports.lifestream = function() {
        showNav('lifestream');
        $(selector).find('.quick_form').html(lifestream_t());

        var target = document.getElementById('load-spinner');
        var spinner_opts = {
          lines: 7, // The number of lines to draw
          length: 6, // The length of each line
          width: 3, // The line thickness
          radius: 0, // The radius of the inner circle
          corners: 0.3, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          color: '#000', // #rgb or #rrggbb
          speed: 2.0, // Rounds per second
          trail: 29, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 0, // Top position relative to parent in px
          left: 0 // Left position relative to parent in px
        };


        couchr.get('_ddoc/_show/app_settings/app_settings', function(err, ddoc_settings) {
          if (!ddoc_settings || !ddoc_settings.Services) return show_settings_messgage();
          var spinner = new Spinner.Spinner(spinner_opts).spin(target);
          var settings = {
            list: ddoc_settings.Services
          };
          async.parallel({
              lifestream : function(cb){
                  $('#lifestream').lifestream(settings, cb);
              },
              previous : function(cb) {
                  couchr.get('_ddoc/_view/service_by_date', {limit: 200}, function(err, resp){
                      var ids = {};
                      _.each(resp.rows, function(row){
                          var hash = [row.value.service, row.value.user, row.key].join('-');
                          ids[hash] = 'exists';
                      });
                      cb(null, ids);
                  });
              }
          }, function(err, results){
              var docs = [];
              _.each(results.lifestream, function(item){
                  //item._id = item.config.service + '-' + item.date.getTime();
                  var hash = [item.config.service, item.config.user, item.date.getTime()].join('-');
                  if (results.previous[hash]) return;
                  item.type = 'lifestream.service';
                  item.timestamp = item.date.getTime();
                  delete item.config._settings;
                  docs.push(item);
              });
              if (docs.length > 0){
                  couchr.post('_db/_bulk_docs', {docs: docs}, function(err, resp){
                      stop_lifestream_spinner(spinner);
                  });
              } else {
                stop_lifestream_spinner(spinner);
              }

          });
        });
    };

    function stop_lifestream_spinner(spinner){
      setTimeout(function(){
        spinner.stop();
        $('.load-status').html('Feeds saved.');
      }, 1000);
    }

    exports.routes = function() {
       return  {
            '/quick/tag' : exports.tag,
            '/quick/people' : exports.people,
            '/quick/journal' : exports.journal,
            '/quick/lifestream' : exports.lifestream,
            '/quick' : exports.journal
        };
    };



    function showNav(active) {
        options.emitter.emit('section', 'quick');
        $(selector).html(base_t());
        $(selector).find('.nav-tabs').removeClass('active');
        $(selector).find('.' + active).addClass('active');
    }


    return exports;
});