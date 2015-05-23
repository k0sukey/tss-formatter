## tss-formatter

**IMPORTANT**

tss-formatter in development. There is a possibility to destroy the tss files. Please be ahead, ```--dryrun```.

### Description

tss files formatter, order, beautifully for your coding standards.

#### Before

```json
"Label": {
   layout: "vertical",
  color: '#ffffff',
	 width:120,
  backgroundColor: '#000000',
	left: "100dp",
  borderColor: "#ff0000",
  borderWidth: 1,
top:10,
  height: "200",
}
```

#### After

```json
'View': {
	top: 10,
	left: 100,
	width: 120,
	height: 200,
	backgroundColor: '#000000',
	borderWidth: 1,
	borderColor: "#ff0000",
	color: '#ffffff',
	layout: 'vertical'
}
```

### Install

```sh
$ npm install tss-formatter -g
```

### Usage

Please put the ```.tssrc``` file to the project directory.

```sh
$ cd /path/to/projectDir
$ tssf
```

#### Specified project directory

```sh
$ tssf --project-dir /path/to
```

#### Dry run

```sh
$ tssf --dryrun
```

### .tssrc

Default ```.tssrc```.

```json
{
	"titanium": "Ti",          // or Titanium
	"eof": "",                 // or \n
	"quote": "'",              // or \"
	"indent": "\t",            // or spaces
	"strip_defaultunit": true, // or false
	"guess_number": [
		"top",
		"right",
		"bottom",
		"left",
		"width",
		"height",
		"borderWidth",
		"borderRadius",
		"fontSize"
	],
	"order": [
		"top",
		"right",
		"bottom",
		"left",
		"width",
		"height",
		"backgroundColor",
		"backgroundImage",
		"backgroundRepeat",
		"barColor",
		"barImage",
		"borderWidth",
		"borderRadius",
		"borderColor",
		"icon",
		"image",
		"title",
		"text",
		"textAlign",
		"verticalAlign",
		"font",
		"color",
		"opacity",
		"enabled",
		"touchEnabled",
		"layout",
		"zIndex"
	]
}
```

### Known Issues

* Comments from being deleted
* Support of deep hierarchy properties

### License

MIT