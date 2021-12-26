const noNewLine = ['input', 'span', 'b', 'i', 'textarea', 'img', 'link'];

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

		this.parent = null;
		this.children = [];

		this.classes = [];
		this.attributes = {};
	}

	addChild(node) {
		node.parent = this;
		return this.children.push(node);
	}

	duplicate() {
		let newNode = new Node(this.tag);

		newNode.children = this.children.map(child => {
			return child.duplicate();
		});

		newNode.parent = this.parent;
		newNode.classes = [].concat(this.classes);
		newNode.attributes = Object.create(this.attributes);

		return newNode;
	}

	toString(tabAmount=0) {
		let tabs = '\t'.repeat(tabAmount);

		if (this.tag == "text") return `${tabs}${this.attributes.value}\n`;
		if (this.classes.length) {
                	this.attributes.class = this.classes.join(' ');
                }

		let result = `${tabs}<${this.tag}`;
		result += `${assembleAttributes(this.attributes)}>`;

		if (this.children.length > 0) result += '\n';

		for (const child of this.children) {
			result += child.toString(tabAmount + 1);
		}

		if (!noNewLine.includes(this.tag)) result += tabs;

		result += `</${this.tag}>\n`;
		return result;
	}
}

module.exports = Node;
