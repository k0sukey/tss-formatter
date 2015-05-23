var _ = require('lodash');

var formatter = function(params, depth, tssrc){
	var result,
		regex = new RegExp('^(\\d+)' + tssrc.defaultunit + '$');
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
			result.push(index + ': ' + formatter({
					name: index,
					value: item
				}, ++depth, tssrc));
		});
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
		} else {
			result = tssrc.quote + params.value + tssrc.quote;
		}
	}

	return result;
};
module.exports = formatter;