var _ = require('lodash'),
	parser = require('color-parser'),
	colors = require('./colors').colors;

function hex4(str) {
	if ('#' === str[0] && 5 === str.length) {
		var alpha =_.filter(colors, function(item){
			return item.hex.toUpperCase() === (str[1] + str[1]).toUpperCase();
		});

		return {
			r: parseInt(str[2] + str[2], 16),
			g: parseInt(str[3] + str[3], 16),
			b: parseInt(str[4] + str[4], 16),
			a: alpha[0].per ? alpha[0].per * 0.01 : alpha[0].per,
			o: str[1] + str[1]
		};
	}
}

function hex8(str) {
	if ('#' === str[0] && 9 === str.length) {
		var alpha =_.filter(colors, function(item){
			return item.hex.toUpperCase() === str.slice(1, 3).toUpperCase();
		});

		return {
			r: parseInt(str.slice(3, 5), 16),
			g: parseInt(str.slice(5, 7), 16),
			b: parseInt(str.slice(7, 9), 16),
			a: alpha[0].per ? alpha[0].per * 0.01 : alpha[0].per,
			o: str.slice(1, 3)
		};
	}
}

function hexdouble(num) {
	var str = num.toString(16);
	return str.length < 2 ? '0' + str : str;
}

function tohex(color) {
	if (_.has(color, 'a')) {
		if (_.has(color, 'o')) {
			return '#' + color.o + hexdouble(color.r) + hexdouble(color.g) + hexdouble(color.b);
		} else {
			var alpha =_.filter(colors, function(item){
				return item.per === color.a * 100;
			});

			return '#' + alpha[0].hex + hexdouble(color.r) + hexdouble(color.g) + hexdouble(color.b);
		}
	} else {
		return '#' + hexdouble(color.r) + hexdouble(color.g) + hexdouble(color.b);
	}
}

function torgb(color) {
	if (_.has(color, 'a')) {
		return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + color.a + ')';
	} else {
		return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
	}
}

var formatter = function(params, depth, tssrc){
	var result,
		regex = new RegExp('^(\\d+)' + tssrc.defaultunit + '$'),
		temp = [];

	if (_.isString(params.value) &&
		params.value.match(/^__ALLOY_EXPR__--/)) {
		result = params.value.replace(/^__ALLOY_EXPR__--/, '').replace(/^Titanium\.|Ti\./, tssrc.titanium + '.');
	} else if (_.isArray(params.value)) {
		result = []; 
		_.each(params.value, function(item, index){
			if (_.isObject(item)) {
				temp = formatter({
						name: params.name,
						value: item
					}, ++depth, tssrc);

				_.each(temp, function(item, index){
					temp[index] = tssrc.indent + tssrc.indent + tssrc.indent + item;
				});
				result.push('{\n' + temp.join(',\n') + '\n' + tssrc.indent + tssrc.indent + '}');
			} else {
				result.push(formatter({
						name: params.name,
						value: item
					}, ++depth, tssrc));
			}
		});
	} else if (_.isObject(params.value)) {
		result = []; 
		_.each(params.value, function(item, index){
			if (_.isObject(item)) {
				temp = formatter({
						name: index,
						value: item
					}, ++depth, tssrc);

				_.each(temp, function(item, index){
					temp[index] = tssrc.indent + tssrc.indent + tssrc.indent + item;
				});
				result.push('{\n' + temp.join(',\n') + '\n' + tssrc.indent + tssrc.indent + '}');
			} else {
				result.push(index + ': ' + formatter({
						name: index,
						value: item
					}, ++depth, tssrc));
			}
		});
	} else if (_.isNull(params.value)) {
		result = 'null';
	} else if (_.isBoolean(params.value)) {
		if (params.value) {
			result = 'true';
		} else {
			result = 'false';
		}
	} else if (_.isNumber(params.value)) {
		result = params.value;
	} else {
		if (tssrc.strip_defaultunit &&
			_.indexOf(tssrc.guess_number, params.name) > -1 &&
			params.value.match(regex)) {
			result = params.value.replace(regex, '$1');
		} else if (_.indexOf(tssrc.guess_color, params.name) > -1 &&
			params.value !== 'transparent') {
			var color = parser(params.value) || hex4(params.value) || hex8(params.value);

			if (color) {
				if (0 === params.value.indexOf('rbg(') ||
					'#' === params.value[0] && 4 === params.value.length ||
					'#' === params.value[0] && 7 === params.value.length) {
					delete color.a;
				}

				switch (tssrc.color_format) {
					case 'hex':
						params.value = tohex(color);
						if (_.has(tssrc, 'color_hex_uppercase')) {
							if (tssrc.color_hex_uppercase) {
								params.value = params.value.toUpperCase();
							} else {
								params.value = params.value.toLowerCase();
							}
						}
						break;
					case 'rgb':
						params.value = torgb(color);
						break;
				}
			}

			result = tssrc.quote + params.value + tssrc.quote;
		} else {
			result = tssrc.quote + params.value + tssrc.quote;
		}
	}

	return result;
};
module.exports = formatter;