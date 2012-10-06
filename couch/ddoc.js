var _ = require('underscore')._;

exports.views = {};
exports.shows = {};

exports.rewrites = [
    { "description": "Access to this database" , "from": "_db" , "to"  : "../.." },
    { "from": "_db/*" , "to"  : "../../*" },
    { "description": "Access to this design document" , "from": "_ddoc" , "to"  : "" },
    { "from": "_ddoc/*" , "to"  : "*"},
    { "description": "Access to the main CouchDB API", "from": "_couchdb" , "to"  : "../../.."},
    { "from": "_couchdb/*" , "to"  : "../../../*"},
    {from: '/', to: 'index.html'},
    {from:"/tray.jnlp", to:'_show/tray.jnlp'},
    {from: '/*', to: '*'}

];


exports.views.service_by_date = {
    map : function(doc) {
        if (doc.type !== 'lifestream.service' || !doc.timestamp) return;
        var d = new Date(doc.timestamp);
        var value = null;
        if (doc.ignored) value = true;
        emit(d.getTime(), value);
    }
}


exports.validate_doc_update = function(newDoc, oldDoc, userCtx, secObj) {
    var ddoc = this;

    secObj.admins = secObj.admins || {};
    secObj.admins.names = secObj.admins.names || [];
    secObj.admins.roles = secObj.admins.roles || [];

    var IS_DB_ADMIN = false;
    if(~ userCtx.roles.indexOf('_admin')) {
        IS_DB_ADMIN = true;
    }
    if(~ secObj.admins.names.indexOf(userCtx.name)) {
        IS_DB_ADMIN = true;
    }
    for(var i = 0; i < userCtx.roles; i++) {
        if(~ secObj.admins.roles.indexOf(userCtx.roles[i])) {
            IS_DB_ADMIN = true;
        }
    }

    var IS_LOGGED_IN_USER = false;
    if (userCtx.name !== null) {
        IS_LOGGED_IN_USER = true;
    }


    if(IS_DB_ADMIN || IS_LOGGED_IN_USER)
        log('User : ' + userCtx.name + ' changing document: ' +  newDoc._id);
    else
        throw {'forbidden':'Only admins and users can alter documents'};
}



exports.views.audio_by_time = {
   map: function(doc) {
       if (doc.recording) {
           var result = {
               _id: doc._id,
               type: 'recording',
               start : doc.recording.start,
               file : doc._attachments
           };
           if (doc.recording.length) {
               result.end = (doc.recording.length * 1000) + doc.recording.start;
           }
           emit(result.start, result);
       }
   }
}


exports.views.timeline_items = {
    map: function(doc) {
        if (doc.timestamp) {
            emit(doc.timestamp, doc.type)
        }
    }
}


exports.views.mark_totals = {
    map : function(doc) {
        if (doc.timestamp) {
           var start  = doc.timestamp;
           var d = new Date(start);
           var year = Number(d.getFullYear());
           var month = Number(d.getMonth()) + 1;
           var day = Number(d.getDate()) ;
           emit([year, month, day], 1);
        }
    },
    reduce: '_sum'
}

exports.views.audio_totals = {
    map : function(doc) {
        if (doc.recording) {
           var start  = doc.recording.start;
           var length = doc.recording.length;
           if (length == 0) return;
           var d = new Date(start);
           var year = Number(d.getFullYear());
           var month = d.getMonth() + 1;
           if (month <= 9) month = '0' + month;
           var day = d.getDate() ;
           if (day <=9) day = '0' + day;
           emit([Number(year), Number(month), Number(day)], length);
        }
    },
    reduce: '_sum'
}



exports.views.audio_md5s = {
    map : function(doc) {
        if (doc.liferecorder && doc._attachments) {
            for (i in doc._attachments) {
                var attach = doc._attachments[i];
                emit(attach.digest, null);
            }
        }
    },
    reduce: '_count'
}


exports.shows["tray.jnlp"] = function(doc, req) {
    var dd = req.path[2];

    // make our arguments
    var args  = {};
    args.url = 'http://' + req.headers.Host;
    args.db = req.userCtx.db;
    args.recording = req.query.recording;
    args.user = req.userCtx.name;
    if (args.user == null) {
        args.user = req.query.user;
    }
    args.dd = dd;
    var args_str = JSON.stringify(args);

    var href = 'tray.jnlp';
    if (args.user) {
        href += '?user=' + args.user;
    }


    var codebase = 'http://' + req.headers.Host + '/' + req.path[0] + '/_design/'+dd +'/_rewrite/';


    var defaults = { codebase : codebase, href : href};
    var result = '<?xml version=\"1.0\" encoding=\"utf-8\"?>';
    result += '<jnlp spec=\"1.5+\" codebase=\"'+codebase+'\" href=\"'+defaults.href+'\">';
    result += '<information><title>Eckoit Uploader</title><vendor>Eckoit Inc</vendor><homepage>http://eckoit.com</homepage><description kind=\"one-line\">Uploads Audio into Eckoit</description>';



    splash = 'images/splash.png';
    icon = 'images/icon.png'

    result += '<icon kind=\"splash\" href=\"'+ splash +'\"/>';
    result += '<icon href=\"' + icon + '\"/>';
    result += ' <offline-allowed/> ';
    result += ' <shortcut online=\"false\">';
    result += '   <desktop/>';
    result += '   <menu submenu=\"Eckoit Uploader"/>';
    result += ' </shortcut>';
    result += '</information>';
    result += '  <security><all-permissions/></security>';
    result += '  <resources> <j2se version=\"1.6+\" initial-heap-size=\"32m\" max-heap-size=\"128m\" /> ';

    // to be fixed
    result += ' <jar href=\"webstart/eckoit-tray-1.0-SNAPSHOT.jar\" main=\"true\" /> ';
    result += ' <jar href=\"webstart/commons-codec-1.4.jar\"  /> ';
    result += ' <jar href=\"webstart/commons-io-2.0.1.jar\"  /> ';
    result += ' <jar href=\"webstart/commons-lang-2.6.jar\"  /> ';
    result += ' <jar href=\"webstart/commons-logging-1.1.1.jar\"  /> ';
    result += ' <jar href=\"webstart/eventbus-1.4.jar\"  /> ';
    result += ' <jar href=\"webstart/httpclient-4.1.1.jar\"  /> ';
    result += ' <jar href=\"webstart/httpclient-cache-4.1.1.jar\"  /> ';
    result += ' <jar href=\"webstart/httpcore-4.1.jar\"  /> ';
    result += ' <jar href=\"webstart/jackson-core-asl-1.8.4.jar\"  /> ';
    result += ' <jar href=\"webstart/jackson-mapper-asl-1.8.4.jar\"  /> ';
    result += ' <jar href=\"webstart/jaudiotagger-2.0.2.jar\"  /> ';
    result += ' <jar href=\"webstart/joda-time-1.6.2.jar\"  /> ';
    result += ' <jar href=\"webstart/org.ektorp-1.2.1.jar\"  /> ';
    result += ' <jar href=\"webstart/slf4j-api-1.6.1.jar\"  /> ';
    result += ' <jar href=\"webstart/swing-layout-1.0.3.jar\"  /> ';
    result += '</resources>';
    result += '  <application-desc main-class=\"com.googlecode.eckoit.tray.App\">';


    result += '  <argument>'+ args_str + '</argument>';



    result += ' </application-desc>';
    result += '</jnlp>';



    return { 'headers' : {'Content-Type' : 'application/x-java-jnlp-file'}, 'body' :  result }
}

