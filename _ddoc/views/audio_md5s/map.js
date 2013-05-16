function map(doc) {
    if (doc.liferecorder && doc._attachments) {
        for (var i in doc._attachments) {
            var attach = doc._attachments[i];
            emit(attach.digest, null);
        }
    }
}