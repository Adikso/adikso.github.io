const dateFormat = require("./dateformat");

module.exports = function(value) {
	if (!value) return;
	return dateFormat(value, "mmm d, yyyy");
}