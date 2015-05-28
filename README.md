## tss-formatter

**IMPORTANT**

tss-formatter in development. There is a possibility to destroy the tss files. Please be ahead, ```--dryrun``` or ```--diff```.

### Description

Titanium Alloy ```.tss``` files formatter, order, beautifully for your coding standards.

#### Before

```
"Label": {
   layout: "vertical",
  color:'#ffffff',
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

```
'Label': {
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

#### Diff

```sh
$ tssf --diff
```

#### Dry run

```sh
$ tssf --dryrun
```

### .tssrc

Default ```.tssrc```.

```
{
	"titanium": "Ti",             // or Titanium
	"eof": "",                    // or \n
	"quote": "'",                 // or \"
	"indent": "\t",               // or spaces
	"strip_defaultunit": true,    // or false
	"concatenation_comma": false, // or true
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

### Change log

#### 0.0.5

* Added concatenation_comma in .tssrc
* Explicit null judgement

#### 0.0.4

* Fixed case of object in object

#### 0.0.3

* Added ```--diff``` option

#### 0.0.2

* Detect the process.env.HOME/.tssrc

#### 0.0.1

* Initial release

### License

MIT