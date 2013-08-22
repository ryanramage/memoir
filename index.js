var express = require("express");
var vidStreamer = require("vid-streamer");

var settings = {
    "mode": "development",
    "forceDownload": false,
    "random": false,
    "rootFolder": "",
    "rootPath": "",
    "server": "VidStreamer.js/0.1.4"
}

vidStreamer.settings(settings);

var app = express();
app.get("/audio/*", vidStreamer);
app.use(express.static(__dirname + '/public'));

app.listen(3000);