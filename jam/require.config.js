var jam = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "lib/async.js"
        },
        {
            "name": "bird-down",
            "location": "jam/bird-down",
            "main": "bird-down.js"
        },
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
        },
        {
            "name": "Class",
            "location": "jam/Class",
            "main": "class.js"
        },
        {
            "name": "couchr",
            "location": "jam/couchr",
            "main": "couchr-browser.js"
        },
        {
            "name": "d3",
            "location": "jam/d3",
            "main": "d3.v2.js"
        },
        {
            "name": "director",
            "location": "jam/director",
            "main": "director.js"
        },
        {
            "name": "domReady",
            "location": "jam/domReady",
            "main": "domReady.js"
        },
        {
            "name": "EpicEditor",
            "location": "jam/EpicEditor",
            "main": "./src/editor.js"
        },
        {
            "name": "events",
            "location": "jam/events",
            "main": "events.js"
        },
        {
            "name": "garden-app-support",
            "location": "jam/garden-app-support",
            "main": "garden-app-support.js"
        },
        {
            "name": "handlebars",
            "location": "jam/handlebars",
            "main": "handlebars.js"
        },
        {
            "name": "hbt",
            "location": "jam/hbt",
            "main": "hbt.js"
        },
        {
            "name": "jquery",
            "location": "jam/jquery",
            "main": "jquery.js"
        },
        {
            "name": "jquery-lifestream",
            "location": "jam/jquery-lifestream",
            "main": "core.js"
        },
        {
            "name": "jquery.lego",
            "location": "jam/jquery.lego",
            "main": "jquery.lego.js"
        },
        {
            "name": "json.edit",
            "location": "jam/json.edit",
            "main": "json.edit.js"
        },
        {
            "name": "marked",
            "location": "jam/marked",
            "main": "./lib/marked.js"
        },
        {
            "name": "marked-bird-down",
            "location": "jam/marked-bird-down",
            "main": "./lib/marked.js"
        },
        {
            "name": "md5",
            "location": "jam/md5",
            "main": "md5.js"
        },
        {
            "name": "moment",
            "location": "jam/moment",
            "main": "moment.js"
        },
        {
            "name": "simple-uuid",
            "location": "jam/simple-uuid",
            "main": "uuid.js"
        },
        {
            "name": "spin-js",
            "location": "jam/spin-js",
            "main": "spin.js"
        },
        {
            "name": "store",
            "location": "jam/store",
            "main": "store"
        },
        {
            "name": "text",
            "location": "jam/text",
            "main": "text.js"
        },
        {
            "name": "twitter-text",
            "location": "jam/twitter-text",
            "main": "./twitter-text.js"
        },
        {
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        },
        {
            "name": "underscore.string",
            "location": "jam/underscore.string",
            "main": "./lib/underscore.string"
        }
    ],
    "version": "0.2.11",
    "shim": {
        "d3": {
            "exports": "d3"
        },
        "director": {
            "exports": "Router"
        }
    }
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}