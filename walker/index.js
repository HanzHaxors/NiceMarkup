const Node = require('./node');
const preprocessors = require('./preprocessors');
const { STATES } = require('./enums');

const {
	deletePreTabs,
	isElement,
	isProperty,
	isGroupMember,
	isPreProcessor,
	isClass,
	getTabIndex,
	getElementTag,
	getProperty,
	getClassName
} = require('./identifiers');

function process(source) {
	/* Compiler variables */
	let	lastTab = 0,
		tab = 0,
		groupMemberIndex = 0,
		lastTagIndex = 0;
	let lastTagName = "";
	let files = [];
	let parentNode = undefined;
	let lines = source.split('\n');
	let state = STATES.NULL;

	/* Language variables */
	let currentClassName = "";
	let classes = {};

	/* Functions */
	function tabs() { return '\t'.repeat(tab); }
	function getFile() { return files[files.length-1]; }
	function getClass() { return classes[currentClassName]; }

	/* Start process every line */
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		/* Skips comment lines */
		/* But first, lets check if it is pre processor */
		if (isPreProcessor(line)) {
			// Nothing
		} else if (line.replaceAll('\t', '').startsWith('#')) {
			/*
				Check if we are in a CSS file.
				Because in CSS, we can't use
				'#' as a comment
			*/
			if (files.length && getFile().type != "css") continue;
		} else if (line.trim().length == 0) {
			continue;
		}

		/* Process pre-processor */
		if (isPreProcessor(line)) {
			const arguments = line.substring(1).split(' ');
			const action = arguments[0];
			arguments.shift(); // Remove preprocessor action

			const response = preprocessors[action](arguments);

			switch (action) {
				case "file":
					files.push(response);
					parentNode = undefined;
					tab = 0;
					lastTab = 0;
					state = STATES.NULL;
					break;
				case "include":
					/* Insert file content at next line */
					lines = [].concat(
						lines.slice(0, i+1), response, lines.slice(i+1)
					);
					break;
			}

			continue;
		}

		tab = getTabIndex(line);

		/* Are you HTML? */
		if (files.length == 0) {
			throw "Please specify file name first before writing content";
		}

		let file = getFile();
		if (file.type != "html") {
			file.append(line + '\n');
			continue;
		} else if (parentNode == undefined) {
			parentNode = file.content;
		}

		/* These are all HTML algorithm now */
		/* Class definition */
		if (isClass(line) && getFile().content.children.length == 0) {
			currentClassName = getClassName(line);
			let newNode = new Node(currentClassName);

			classes[currentClassName] = newNode;

			parentNode = newNode;
			state = STATES.DEFINE_CLASS;

			continue;
		}

		/* Get element tag */
		if (isElement(line)) {
			let tag = getElementTag(line);
			let elemRegEx = /[a-z]+[a-z0-9]*/i;
			let elemTag = elemRegEx.exec(tag)[0];

			/*
				Oh, this is the end of the previous group?
				Delete the original first.
			*/
			if (groupMemberIndex > 0) {
				let sliced = [].concat(
					parentNode.children.slice(0, lastTagIndex - groupMemberIndex),
					parentNode.children.slice(lastTagIndex - groupMemberIndex + 1)
				);
				parentNode.children = sliced;
			}
			/* Ok, we're done. */
			groupMemberIndex = 0;

			/* Get the new parentNode */
			let node = undefined;
			if (lastTab < tab) {
				if (parentNode.children.length) {
					/* Get into child's scope */
					node = parentNode = parentNode.children[lastTagIndex];
				} else {
					node = parentNode;
				}
			} else if (lastTab > tab) {
				/* Start searching for parentNode after leaving child's scope */
				for (let _i = 0; _i < (lastTab - tab); _i++) {
					node = parentNode = parentNode.parent;
				}
			} else if (lastTab == tab) {
				/* Default */
				node = parentNode;
			} else {
				/*
					TODO: Should've use the `col` and `row`
					variable to point error location
				*/
				console.log("Error");
			}

			if (!node) {
				node = parentNode = getFile().content;
			}

			/* Create new node */
			let newNode = undefined;
			// Change the node when it is a class
			if (classes[elemTag] != undefined) {
				newNode = classes[elemTag].duplicate();
			} else {
				newNode = new Node(elemTag)
			}

			/* Get the node class and id */
			let elemClasses = tag.match(/\.[a-z]+[a-z0-9]*/ig);
			let elemId = tag.match(/#[a-z]+[a-z0-9]*/i);

			/* Put them into the newNode if any */
			if (elemClasses) {
				newNode.classes.push(...elemClasses.map(
					/* Remove the dot (.) prefix */
					c => c.substring(1)
				));
			}
			if (elemId) {
				/* We only pick the first id */
				newNode.attributes.id = elemId[0]
				/* Remove the hashtag (#) prefix */
				.substring(1);
			}

			/* Get the node multiplier value */
			let elemMultiplier = tag.match(/\*[0-9]+/);
			if (elemMultiplier == null) elemMultiplier = ["*1"];
			elemMultiplier = parseInt(elemMultiplier[0].substring(1));

			/* Add the new node */
			for (let i = 0; i < elemMultiplier; i++) {
				lastTagIndex = node.addChild(newNode) - 1;
			}

			lastTag = elemTag;
		}

		/* Process group member */
		if (isGroupMember(line)) {
			line = line.replace(/\-\s*/, '');

			/* Clone the base element */
			let clone = parentNode.children[lastTagIndex - groupMemberIndex].duplicate();
			lastTagIndex = parentNode.addChild(clone) - 1;
			groupMemberIndex++;
		}

		/* Get Property */
		if (isProperty(line)) {
			/*
				Normalize additional tab.
				If we don't type this, we MUST use this style:

				element
				property: value
			*/
			tab--;

			let property = getProperty(line);
			/* Special touches for special properties */
			if (property.name == "text") {
				let newNode = new Node("text");

				if (!property.isMultiline) {
					newNode.attributes.value = property.value;
				} else {
					/* Assemble multiline value */
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
								i = o;  // Tell the processor we are on
									// several next lines
								o = -2; // Breaks previous loop (next is o++)
								break;  // Breaks this loop
							}

							/* Append character to buffer and reset stuff */
							buf += c;
							escape = false;
						}

						paragraph += buf + ' ';
					}

					newNode.attributes.value = paragraph.trim();
				}

				/* Finally, add the child */
				parentNode.children[lastTagIndex].addChild(newNode);
			} else if (property.name[0] == '@') {
				/* CSS `style` attribute */
				let cssProp = property.name.substring(1);
				let value = property.value;

				/*
					This if statement ensure that we will not do:

					undefined + "str" = "undefinedstr"
				*/
				if (parentNode.children[lastTagIndex].attributes.style == undefined) {
					parentNode.children[lastTagIndex].attributes.style = "";
				}

				/* Make semicolon ending optional */
				if (!value.endsWith(';')) value += ';';
				parentNode.children[lastTagIndex].attributes.style += `${cssProp}: ${value}`;
			} else {
				/* Normal attribute */
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
