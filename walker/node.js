class Node {
	constructor(tag) {
		this.tag = tag;

		this.children = [];
		this.parent = null;

		this.attributes = {};
	}

	addChild(node) {
		node.parent = this;
		return this.children.push(node);
	}

	toString(tabAmount=0) {
		let tabs = '\t'.repeat(tabAmount);

		if (this.tag == "text") return `${tabs}${this.attributes.value}\n`;

		let result = `${tabs}<${this.tag}>\n`;

		for (const child of this.children) {
			result += child.toString(tabAmount + 1);
		}

		result += `${tabs}</${this.tag}>\n`;
		return result;
	}
}

module.exports = Node;
