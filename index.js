/*
 * This is the compiler
 */

const fs = require('fs');

const walker = require('./walker');
const utils = require('./utils');
const { print } = require('./utils');

function showHelp() {
	print(
		"USAGE:\n" +
		"node index.js <filename>"
	);
}

function main() {
	/*
	 * The first two arguments are
	 * node location and script location.
	 * So just remove them.
	 */
	const argv = process.argv.slice(2);

	if (argv.length == 0) {
		return showHelp();
	}

	const source = argv[0];
	let destination = argv[1];

	/* Confirms about the source file existence */
	const stats = fs.statSync(source);
	if (stats.isDirectory()) {
		return print("Directory support will be added in the future");
	} else if (!stats.isFile()) {
		return print("Cannot process irregular file.");
	}

	if (!destination) {
		destination = utils.getFilename(source) + ".html";
	}

	const content = fs.readFileSync(source).toString();
	let result = walker.process(content);
	fs.writeFileSync(destination, result);
}

main();
