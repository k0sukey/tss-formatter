var _ = require('lodash'),
	chalk = require('chalk'),
	fs = require('fs-extra'),
	meow = require('meow'),
	path = require('path'),
	tiappxml = require('tiapp.xml'),
	wrench = require('wrench'),
	CONST = require('alloy/Alloy/common/constants'),
	STYLER = require('alloy/Alloy/commands/compile/styler'),
	FORMATTER = require('./typeFormatter');

var cli = meow({
	pkg: '../package.json',
	help: [
		'Usage',
		'  --project-dir <directory>',
		'  --dryrun'
	].join('\n')
});

!_.has(cli.flags, 'projectDir') && (cli.flags.projectDir = '.');

var parentDir = path.dirname(module.parent.filename),
	tssrc = JSON.parse(fs.readFileSync(path.join(parentDir, '../.tssrc')).toString());

var localTssrc = path.resolve(path.join(cli.flags.projectDir, '.tssrc'));
if (fs.existsSync(localTssrc)) {
	tssrc = JSON.parse(fs.readFileSync(localTssrc).toString());
}

var tiappXml = path.resolve(path.join(cli.flags.projectDir, 'tiapp.xml'));
if (!fs.existsSync(tiappXml)) {
	console.error(chalk.red('[ERROR]') + ' Not exists directory containing the tiapp.xml ' + chalk.cyan(cli.flags.projectDir));
	return;
}

var tiapp = tiappxml.load(tiappXml),
	defaultunit = tiapp.getProperty('ti.ui.defaultunit', null);
if (defaultunit) {
	tssrc = _.extend({
		defaultunit: defaultunit
	}, tssrc);
} else {
	tssrc = _.extend({
		strip_defaultunit: false,
		defaultunit: ''
	}, tssrc);
}

var alloyDir = path.resolve(path.join(cli.flags.projectDir, CONST.ALLOY_DIR));
if (!fs.existsSync(alloyDir)) {
	console.error(chalk.red('[ERROR]') + ' Not exists directory containing the alloy project ' + chalk.cyan(cli.flags.projectDir));
	return;
}

var styles = [],
	regex = new RegExp('\\.' + CONST.FILE_EXT.STYLE + '$');
if (fs.existsSync(path.join(alloyDir, CONST.DIR.STYLE))) {
	var files = wrench.readdirSyncRecursive(path.join(alloyDir, CONST.DIR.STYLE));
	_.each(files, function(style){
		if (style.match(regex)) {
			styles.push(path.join(alloyDir, CONST.DIR.STYLE, style));
		}
	});
} else {
	console.warn(chalk.yellow('[WARN]') + ' Not exists styles directory containing the alloy project ' + chalk.cyan(path.join(alloyDir, CONST.DIR.STYLE)));
}

_.each(styles, function(style){
	var newStyle = '';

	_.each(STYLER.loadStyle(style), function(properties, selector){
		var newProperties = [],
			tmpProperties = [],
			order = 10000;

		_.each(properties, function(value, name){
			var index = _.indexOf(tssrc.order, name);

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
				tmp = FORMATTER(property, 0, tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = tssrc.indent + tssrc.indent + item;
				});
				newProperties.push(tssrc.indent + property.name + ': ' + '[\n' + tmp.join(',\n') + '\n' + tssrc.indent + ']');
			} else if (_.isObject(property.value)) {
				tmp = FORMATTER(property, 0, tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = tssrc.indent + tssrc.indent + item;
				});
				newProperties.push(tssrc.indent + property.name + ': ' + '{\n' + tmp.join(',\n') + '\n' + tssrc.indent + '}');
			} else {
				newProperties.push(tssrc.indent + property.name + ': ' + FORMATTER(property, 0, tssrc));
			}
		});
		newStyle += tssrc.quote + selector + tssrc.quote + ': {\n' + newProperties.join(',\n') + '\n}\n';
	});

	if (cli.flags.dryrun) {
		console.info(chalk.cyan(style));
		console.info(newStyle + tssrc.eof);
	} else {
		fs.writeFileSync(style, newStyle + tssrc.eof);
	}
});