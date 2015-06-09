var _ = require('lodash'),
	cheerio = require('cheerio'),
	fs = require('fs-extra'),
	path = require('path'),
	request = require('request');

request.get({
	url: 'http://online.sfsu.edu/chrism/hexval.html'
}, function(err, response, body){
	if (err) {
		return;
	}

	var data = [],
		index = 0,
		$ = cheerio.load(body);
	$('tr').map(function(){
		var tr = cheerio.load($(this).html()),
			td,
			j,
			k;
		tr('td').map(function(i){
			if (tr(this).text() === 'dec') {
				td = 'dec';
			} else if (tr(this).text() === 'hex') {
				td = 'hex';
				j = index - 15;
			} else if (tr(this).text() === 'per') {
				td = 'per';
				k = index - 15;
			} else {
				if (td === 'dec') {
					index = parseInt(tr(this).text(), 10);
					data[index] = {
						dec: tr(this).text().replace(/\n/, ''),
						hex: '',
						per: ''
					};
				} else if (td === 'hex') {
					data[j].hex = tr(this).text().replace(/\n/, '');
					j++;
				} else if (td === 'per') {
					data[k].per = tr(this).text().replace(/\n/, '');
					k++;
				}
			}
		});
	});

	var result = [];
	_.each(data, function(item, index){
		result.push('\t{\n\t\tdec: ' + item.dec + ',\n' +
			'\t\thex: \'' + item.hex + '\',\n' +
			'\t\tper: ' + item.per + '\n' +
			'\t}');
	});

	fs.writeFileSync(path.join(process.env.PWD, 'lib', 'colors.js'),
		'// from http://online.sfsu.edu/chrism/hexval.html\n\nexports.colors = [\n' + result.join(',\n') + '\n];');
});