/*
 * This is the compiler
 */

const fs = require('fs');
const path = require('path');
const sass = require('sass');

const walker = require('./walker');
const utils = require('./utils');

function showHelp() {
	console.log(
		"USAGE:\n" +
		"nice <sourceFile> [destinationFolder]"
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
		return console.log("Directory support will be added in the future");
	} else if (!stats.isFile()) {
		return console.log("Cannot process irregular file.");
	}

	if (!destination) {
		destination = source.replace(/\./g, '_') + "_exported";
	}

	const resolvedDestination = path.resolve(destination);

	const content = fs.readFileSync(source).toString();
	let exported = walker.process(content);

	try {
		fs.mkdirSync(destination);
	} catch (e) {
		if (e.errno == -17) {
			console.info("Destination directory already exists, overwriting...");
		} else { throw e; }
	}

	for (const file of exported.files) {
		const filePath = path.join(resolvedDestination, file.path);
		const fileDir = path.dirname(filePath);

		try {
			fs.mkdirSync(fileDir, { recursive: true });
		} catch (e) {
			if (e.errno != -17) throw e;
		}

		if (file.type == "css") {
			console.info(`Compiling ${file.path}...`);
			const result = sass.renderSync({ data: file.content.toString() });
			fs.writeFileSync(filePath, result.css.toString());
		} else if (file.type == "html") {
			fs.writeFileSync(filePath, file.content.children[0].toString());
		} else {
			fs.writeFileSync(filePath, file.content.toString());
		}

		console.info(`${file.path} has been created`);
	}
}

main();
