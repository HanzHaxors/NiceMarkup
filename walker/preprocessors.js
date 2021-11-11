const path = require('path');
const fs = require('fs');

const Node = require('./node');

class File {
	constructor(filePath, content) {
		this.path = filePath;
		let type = this.type = path.extname(filePath).substring(1);

		if (type == "html") {
			this.content = new Node('root');
		} else {
			this.content = content || '';
		}
	}

	append(content) {
		this.content += content;
	}
}

/*
	Example:
	#file index.html
	#file js/index.js
	#file css/index.css
	#file test/a.html
 */
function file(args) {
	const filePath = args.join(' ');
	const file = new File(filePath);

	return file;
}

/*
	Example:
	#include products.nice
	#include about-us.nice
*/
function include(args) {
	const filePath = args.join(' ');
	const content = fs.readFileSync(filePath);

	return content.toString().split('\n');
}

module.exports = {
	file,
	include
};
