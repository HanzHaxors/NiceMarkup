# NiceMarkup
NiceMarkup is a simple language to help web developers build their website. As simple as it is, it has no configuration file, ever.

## Installation
```
sudo npm install -g nicemarkup
```

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

## Usage
```sh
nice <sourceFile> [destinationFolder]
```
If `destinationFolder` is not defined, the destination folder name will be based from `sourceFile`.

## Examples
There is so many examples in [examples](examples), you're welcome.
