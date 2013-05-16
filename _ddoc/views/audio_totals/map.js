function map(doc) {
    if (doc.recording) {
       var start  = doc.recording.start;
       var length = doc.recording.length;
       if (length === 0) return;
       var d = new Date(start);
       var year = Number(d.getFullYear());
       var month = d.getMonth() + 1;
       if (month <= 9) month = '0' + month;
       var day = d.getDate() ;
       if (day <=9) day = '0' + day;
       emit([Number(year), Number(month), Number(day)], length);
    }
}