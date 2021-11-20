# NiceMarkup
[![Open Source Helpers](https://www.codetriage.com/hanzhaxors/nicemarkup/badges/users.svg)](https://www.codetriage.com/hanzhaxors/nicemarkup)

NiceMarkup is a simple language to help web developers build their website. As simple as it is, it has no configuration file, ever.

## Why NiceMarkup?
HTML, Emmet, etc. they exists! Why did you create another one?

NiceMarkup is:
<details>
	<summary>
		♻️ Easily Maintainable
	</summary>
	<p>
		NiceMarkup eliminates the need of unnecessary symbols
		and confusing one-liners
	</p>
</details>
<details>
	<summary>
		1️⃣ One For All
	</summary>
	<p>
		One file is all you need in NiceMarkup.
		You can generate a whole website in one file without creating another.
	</p>
</details>
<details>
	<summary>
		👨‍🎓 Not Just HTML, CSS, and JS
	</summary>
	<p>
		You can code everything, using NiceMarkup. PHP, Python, C, C++, etc.
		But, NiceMarkup only focuses on frontend languages.
	</p>
</details>


## Installation
```
sudo npm install -g nicemarkup
```

## Hello World
```nice
#file index.html
html
	head
		title
			text: NiceMarkup Hello World
	body
		h1
			text: Hello World!
```
> Taken from [examples/hello.nice](examples/hello.nice)

We don't have any closing tag and we use css selector (soon WIP) to define the elements

## Usage
```sh
nice <sourceFile> [destinationFolder]
```
If `destinationFolder` is not defined, the destination folder name will be based on `sourceFile`.

## Examples
There is so many examples in [examples folder](examples), you're welcome.
