# NiceMarkup
NiceMarkup is a simple language to help web developers build their website. As simple as it is, it has no configuration file, ever.

## Hello World
```nice
html
	head
		title
			text: NiceMarkup Hello World
	body
		h1
			text: Hello World!
```
> Taken from [examples/hello.nice](examples/hello.nice)
We don't have any closing tag and we use css selector to define the element

## Simple Compiler
```sh
node index.js <sourceFile> [destinationFile]
```
