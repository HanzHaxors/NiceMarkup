function assembleAttributes(attrs) {
	let result = " ";
	for (const attr in attrs) {
		result += `${attr}="${attrs[attr]}" `;
	}

	return result.substring(0, result.length-1);
}

class Node {
	constructor(tag) {
		this.tag = tag;

		this.children = [];
		this.parent = null;
		this.classes = [];

		this.attributes = {};
	}

	addChild(node) {
		node.parent = this;
		return this.children.push(node);
	}

	toString(tabAmount=0) {
		let tabs = '\t'.repeat(tabAmount);

		if (this.tag == "text") return `${tabs}${this.attributes.value}\n`;
		if (this.classes.length) {
                	this.attributes.class = this.classes.join(' ');
                }

		let result = `${tabs}<${this.tag}`;
		result += `${assembleAttributes(this.attributes)}>\n`;

		for (const child of this.children) {
			result += child.toString(tabAmount + 1);
		}

		result += `${tabs}</${this.tag}>\n`;
		return result;
	}
}

module.exports = Node;
