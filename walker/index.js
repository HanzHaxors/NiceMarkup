const Node = require('./node');
const preprocessors = require('./preprocessors');

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
	line = deletePreTabs(line).trim();
	const alphregex = /[a-zA-Z]/;
	const regex = /[a-zA-Z0-9]+:.*/;

	return line.length && alphregex.test(line[0]) && regex.test(line);
}

function isGroupMember(line) {
	line = deletePreTabs(line);
	return line.startsWith('-');
}

function isPreProcessor(line) {
	let regex = /#[a-zA-Z]+/;
	let action = line.substring(1).split(' ')[0];
	return regex.test(line) && Object.keys(preprocessors).includes(action);
}

function getElementTag(line) {
	line = deletePreTabs(line);
	const regex = /[a-zA-Z]+[a-zA-Z0-9]*/;

	let name = regex.exec(line);
	return name[0];
}

function getProperty(line) {
	let name = "", value = "";
	line = deletePreTabs(line).trim();
	line = line.split(':');

	name = line[0];
	line.shift();
	value = line.join(':').trim();

	return {name, value};
}

function process(source) {
	/* Position variable */
	let col = 0, row = 0, lastTab = 0, tab = 0;
	let groupMemberIndex = 0;
	let lastTagIndex = 0;
	let lastTagName = "";

	function tabs() { return '\t'.repeat(tab); }

	/* Creating the tree */
	let files = [];
	let parentNode = undefined;
	let lines = source.split('\n');

	for (let line of lines) {
		/* Skips comment lines */
		/* But first, lets check if it is pre processor */
		if (!isPreProcessor(line) && line.replaceAll('\t', '').startsWith('#')) continue;
		if (line.length == 0) continue;

		/* Process pre-processor */
		if (isPreProcessor(line)) {
			const arguments = line.substring(1).split(' ');
			const action = arguments[0];
			arguments.shift();

			const response = preprocessors[action](arguments);

			switch (action) {
				case "file":
					files.push(response);
					parentNode = undefined;
					break;
			}

			continue;
		}

		tab = getTabIndex(line);

		/* Are you HTML? */
		if (files.length == 0) {
			throw "Please specify file name first before writing content";
		} if (files[files.length-1].type != "html") {
			files[files.length-1].append(line + '\n');
			continue;
		} else if (parentNode == undefined) {
			parentNode = files[files.length-1].content;
		}

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
				console.log("Error");
			}

			let newNode = new Node(tag);
			lastTagIndex = node.addChild(newNode) - 1;
			lastTag = tag;
			groupMemberIndex = 0;
		}

		/* Process group member */
		if (isGroupMember(line)) {
			if (groupMemberIndex == 0) {
				/* Remove the group tag name identifier node */
				parentNode.children = parentNode.children.slice(0, lastTagIndex);
			}

			line = line.replace(/\-\s*/, '');
			let clone = new Node(lastTag);
			lastTagIndex = parentNode.addChild(clone) - 1;
			groupMemberIndex++;
		}

		/* Get Property */
		if (isProperty(line)) {
			tab--;

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

	/* Making the result */
	return {
		files
	};
}

module.exports = {
	process
};
