function map(doc) {
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