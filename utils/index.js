function getFilename(path) {
	let parts = path.split('/');
	return parts[parts.length-1];
}

module.exports = {
	getFilename,

	print: console.log
};
