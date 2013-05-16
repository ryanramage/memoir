
function app_settings(doc, req) {
    var data = doc || {_id: 'app_settings', type: 'settings'};
    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify(data)
    };
};