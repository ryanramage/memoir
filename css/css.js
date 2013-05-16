define([
    'jscss',
    'text!jam/json.edit/json.edit.bootstrap.css',
    'text!jam/cal-heatmap/cal-heatmap.css',
    'text!jam/jquery-lifestream/css/lifestream.css',
    'lessc!./app.less',
], function(jscss, a, b, c){
    jscss.embed(a);
    jscss.embed(b);
    jscss.embed(c);
    console.log('css loaded')
})