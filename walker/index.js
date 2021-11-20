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
	const regex = /[^a-z0-9\-\.\#]+/i;
	return line.length && !regex.test(line) && !regex.test(line[0]);
}

function isProperty(line) {
	line = deletePreTabs(line).trim();
	const alphregex = /[a-z@]/i;
	const regex = /[a-z0-9@]+:.*/i;

	return line.length && alphregex.test(line[0]) && regex.test(line);
}

function isGroupMember(line) {
	line = deletePreTabs(line);
	return line.startsWith('-');
}

function isPreProcessor(line) {
	let regex = /#[a-z]+/i;
	let action = line.substring(1).split(' ')[0];
	return regex.test(line) && Object.keys(preprocessors).includes(action);
}

function getElementTag(line) {
	line = deletePreTabs(line);
	const regex = /[a-z]+[a-z0-9\.#]*/i;

	let name = regex.exec(line);
	return name[0];
}

function getProperty(line) {
	let name = "", value = "", isMultiline = false;
	line = deletePreTabs(line).trim();
	line = line.split(':');

	name = line[0];
	line.shift();
	value = line.join(':').trim();

	if (value == '{') isMultiline = true;

	return {name, value, isMultiline};
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

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		/* Skips comment lines */
		/* But first, lets check if it is pre processor */
		if (
			!isPreProcessor(line) && line.replaceAll('\t', '').startsWith('#') &&
			(files.length ? files[files.length-1].type != "css" : true)
		) continue;
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
					tab = 0;
					lastTab = 0;
					break;
				case "include":
					/* Insert file content at next line */
					lines = [].concat(lines.slice(0, i+1), response, lines.slice(i+1));
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
				for (let _i = 0; _i < (lastTab - tab); _i++) {
					parentNode = node = parentNode.parent;
				}
			} else if (lastTab == tab) {
				node = parentNode;
			} else {
				console.log("Error");
			}

			// Create new node
			let elemRegEx = /[a-z]+[a-z0-9]*/i;
			let elemTag = elemRegEx.exec(tag)[0];

			let newNode = new Node(elemTag);

			let classes = tag.match(/\.[a-z]+[a-z0-9]*/ig);
			let elemId = tag.match(/#[a-z]+[a-z0-9]*/i);

			if (classes) newNode.classes.push(...classes.map(c => c.substring(1)));
			if (elemId) newNode.attributes.id = elemId[0].substring(1);

			// Add the new node
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

				if (!property.isMultiline) {
					newNode.attributes.value = property.value;
				} else {
					let paragraph = "";

					for (let o = i + 1; o != -1; o++) {
						let currentLine = lines[o];
						let buf = "";
						let escape = false;

						for (const c of currentLine) {
							if (c == '\t') continue;
							if (c == '\\') {
								escape = true;
								continue;
							}

							if (c == '}' && !escape) {
								/* We could've use labels, but no. */
								i = o;
								o = -2; // Breaks previous loop
								break;  // Breaks this loop
							}

							buf += c;
							escape = false;
						}

						paragraph += buf + '\n';
					}

					newNode.attributes.value = paragraph.trim();
				}

				parentNode.children[lastTagIndex].addChild(newNode);
			} else if (property.name[0] == '@') {
				let cssProp = property.name.substring(1);
				let value = property.value;

				if (parentNode.children[lastTagIndex].attributes.style == undefined) {
					parentNode.children[lastTagIndex].attributes.style = "";
				}

				if (!value.endsWith(';')) value += ';';
				parentNode.children[lastTagIndex].attributes.style += `${cssProp}: ${value}`;
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
