const { print } = require('../utils');
const Node = require('./node');

function deletePreTabs(line) {
	return line.substring(getTabIndex(line));
}

function getTabIndex(line) {
	let i = 0;
	for (i = 0; 1; i++) {
		if (line[i] != '\t') break;
	}
	return i;
}

function isElement(line) {
	line = deletePreTabs(line);
	const regex = /[^a-zA-Z0-9\-]+/;
	return line.length && !regex.test(line) && !regex.test(line[0]);
}

function isProperty(line) {
	line = deletePreTabs(line);
	const alphregex = /[a-zA-Z]/;
	const regex = /[a-zA-Z0-9]+:.*/;

	return line.length && alphregex.test(line[0]) && regex.test(line);
}

function getElementTag(line) {
	line = deletePreTabs(line);
	const regex = /[a-zA-Z]+[a-zA-Z0-9]*/;

	let name = regex.exec(line);
	return name[0];
}

function getProperty(line) {
	let name = "", value = "";
	line = deletePreTabs(line);
	line = line.split(':');

	name = line[0];
	line.shift();
	value = line.join(':');

	return {name, value};
}

function process(source) {
	/* Position variable */
	let col = 0, row = 0, lastTab = 0, tab = 0;
	let lastTagIndex = 0;

	function tabs() { return '\t'.repeat(tab); }

	/* Creating the tree */
	const root = new Node('root');
	let parentNode = root;
	let lines = source.split('\n');

	for (const line of lines) {
		/* Skips comment lines */
		if (line.replaceAll('\t', '').startsWith('#')) continue;

		tab = getTabIndex(line);

		/* Get element tag */
		if (isElement(line)) {
			let tag = getElementTag(line);

			let node = undefined;
			if (lastTab < tab) {
				parentNode = node = parentNode.children[lastTagIndex];
			} else if (lastTab > tab) {
				parentNode = node = parentNode.parent;
			} else if (lastTab == tab) {
				node = parentNode;
			} else {
				print("Error");
			}

			let newNode = new Node(tag);
			lastTagIndex = node.addChild(newNode) - 1;
		}

		/* Get Property */
		if (isProperty(line)) {
			let property = getProperty(line);

			if (property.name == "text") {
				let newNode = new Node("text");
				newNode.attributes.value = property.value;
				parentNode.children[lastTagIndex].addChild(newNode);
			} else {
				parentNode.children[lastTagIndex].attributes[property.name] = property.value;
			}
		}

		lastTab = tab;
	}

	/* Makin the result */
	return root.children[0].toString();
}

module.exports = {
	process
};
