const preprocessors = require('./preprocessors');

function deletePreTabs(line) {
	return line.substring(getTabIndex(line));
}

/* Is */
function isElement(line) {
	line = deletePreTabs(line);
	const regex = /[^a-z0-9\-\.\#\*]+/i;
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

function isClass(line) {
	line = deletePreTabs(line);
	return line.startsWith('class');
}

/* Gets */
function getTabIndex(line) {
	let i = 0;
	for (i = 0; 1; i++) {
		if (line[i] != '\t') break;
	}
	return i;
}

function getElementTag(line) {
	line = deletePreTabs(line);
	const regex = /[a-z]+[a-z0-9\.\#\*]*/i;

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

function getClassName(line) {
	line = deletePreTabs(line);

	return line.split(/\s+/)[1].trim();
}

module.exports = {
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
};
