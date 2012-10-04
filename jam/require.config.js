var jam = {
    "packages": [
        {
            "name": "async",
            "location": "jam/async",
            "main": "./lib/async"
        },
        {
            "name": "bootstrap",
            "location": "jam/bootstrap"
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
            "name": "marked",
            "location": "jam/marked",
            "main": "./lib/marked.js"
        },
        {
            "name": "moment",
            "location": "jam/moment",
            "main": "moment.js"
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
            "name": "underscore",
            "location": "jam/underscore",
            "main": "underscore.js"
        }
    ],
    "version": "0.2.6",
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