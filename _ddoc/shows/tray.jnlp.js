function(doc, req) {
    var dd = req.path[2];

    // make our arguments
    var args  = {};
    args.url = 'http://' + req.headers.Host;
    args.db = req.userCtx.db;
    args.recording = req.query.recording;
    args.user = req.userCtx.name;
    if (args.user === null) {
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
    icon = 'images/icon.png';

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



    return { 'headers' : {'Content-Type' : 'application/x-java-jnlp-file'}, 'body' :  result };
}