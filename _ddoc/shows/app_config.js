function app_config(doc, req) {
    var data =  this.config.settings_schema || {};
    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify(data)
    };
}
