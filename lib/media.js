var through = require('through');


exports.add = function(db, start, /*optional*/ end, file, callback) {

	// handle optional end. If only three args, shuffle
	if (!callback) {
		callback = file;
		file = end;
	}

	db.put(start, {
		start: start, 
		end: end,
		file: file
	}, callback);


};

exports.starts_between = function(db, start, end) {
	var options = {
		start: start,
		end: end
	}
  return db.createReadStream({
    start : start,
    end : end
  }).pipe(through(function (entry) {
    this.queue(entry.value);
  }));
};

