function person_schema(doc, req) {
    var data = doc || this.config.person_schema;
    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify(data)
    };
}
