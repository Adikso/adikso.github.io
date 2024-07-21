const seperator = {start: '<!-- excerpt start -->', end: '<!-- excerpt end -->'};

module.exports = function(value) {
	if (!value) return;

	const start = value.indexOf(seperator.start);
	const end = value.indexOf(seperator.end);

	if (start !== -1 && end !== -1) {
		return value.substring(start + seperator.start.length, end);
	}

	return ""
}