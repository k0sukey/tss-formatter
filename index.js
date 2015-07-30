var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	optimizer = require('alloy/Alloy/commands/compile/optimizer'),
	grammar = require('alloy/Alloy/grammar/tss'),
	typef = require('./lib/typef');

module.exports = function(tss, options){
	if (!tss || tss === '') {
		throw new Error('tss was undefined or empty');
	}

	options = options || {};

	if (!_.has(options, 'tssrc')) {
		options.tssrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.tssrc'), {
				encoding: 'utf8'
			}));
	}

	if (!_.has(options, 'defaultunit')) {
		options.strip_defaultunit = false;
		options.defaultunit = '';
	}

	tss = /^\s*\{[\s\S]+\}\s*$/gi.test(tss) ? tss : '{\n' + tss + '\n}';
	tss = tss.replace(/(\s)(\\+)(\s)/g, '$1$2$2$3');

	var json;
	try {
		json = grammar.parse(tss);
		optimizer.optimizeStyle(json);
	} catch (e) {
		throw new Error(e.message);
	}

	var style = [];

	_.each(json, function(properties, selector){
		var newProperties = [],
			tmpProperties = [],
			order = options.tssrc.order.length;

		_.each(properties, function(value, name){
			var index = _.indexOf(options.tssrc.order, name);

			if (index > -1) {
				tmpProperties[index] = {
					name: name,
					value: value
				};
			} else {
				tmpProperties[order] = {
					name: name,
					value: value
				};
				order++;
			}
		});

		_.each(_.without(tmpProperties, undefined), function(property){
			var tmp = [];

			if (_.isArray(property.value)) {
				tmp = typef(property, 0, options.tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = options.tssrc.indent + options.tssrc.indent + item;
				});
				newProperties.push(options.tssrc.indent + property.name + ': ' + '[\n' + tmp.join(',\n') + '\n' + options.tssrc.indent + ']');
			} else if (_.isObject(property.value)) {
				tmp = typef(property, 0, options.tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = options.tssrc.indent + options.tssrc.indent + item;
				});
				newProperties.push(options.tssrc.indent + property.name + ': ' + '{\n' + tmp.join(',\n') + '\n' + options.tssrc.indent + '}');
			} else {
				newProperties.push(options.tssrc.indent + property.name + ': ' + typef(property, 0, options.tssrc));
			}
		});
		style.push(options.tssrc.quote + selector + options.tssrc.quote + ': {\n' + newProperties.join(',\n') + '\n}');
	});

	return style.join(options.tssrc.concatenation_comma ? ',\n' : '\n');
};