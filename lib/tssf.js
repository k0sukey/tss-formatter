var _ = require('lodash'),
	chalk = require('chalk'),
	jsdiff = require('diff'),
	fs = require('fs-extra'),
	meow = require('meow'),
	path = require('path'),
	tiappxml = require('tiapp.xml'),
	wrench = require('wrench'),
	CONST = require('alloy/Alloy/common/constants'),
	STYLER = require('alloy/Alloy/commands/compile/styler'),
	typef = require('./typef');

var cli = meow({
	pkg: '../package.json',
	help: [
		'Usage',
		'  --project-dir <directory>',
		'  --config <.tssrc>',
		'  --diff',
		'  --dryrun',
		'  --generate',
		'  --verbose'
	].join('\n')
});

if (cli.flags.diff && cli.flags.dryrun) {
	console.error(chalk.red('[ERROR]') + ' Choose either one');
	return;
}

!_.has(cli.flags, 'projectDir') && (cli.flags.projectDir = '.');

var parentDir = path.dirname(module.parent.filename),
	defaultTssrc = path.join(parentDir, '..', '.tssrc'),
	tssrc = JSON.parse(fs.readFileSync(defaultTssrc, {
			encoding: 'utf8'
		}));

var home = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME,
	homeTssrc = path.resolve(path.join(home, '.tssrc'));
if (fs.existsSync(homeTssrc)) {
	tssrc = JSON.parse(fs.readFileSync(homeTssrc, {
			encoding: 'utf8'
		}));
}

var localTssrc = path.resolve(path.join(cli.flags.projectDir, '.tssrc'));
if (fs.existsSync(localTssrc)) {
	tssrc = JSON.parse(fs.readFileSync(localTssrc, {
			encoding: 'utf8'
		}));
}

if (_.has(cli.flags, 'config')) {
	if (fs.existsSync(cli.flags.config)) {
		tssrc = JSON.parse(fs.readFileSync(cli.flags.config, {
				encoding: 'utf8'
			}));
	} else {
		console.error(chalk.red('[ERROR]') + ' Not exists directory containing the .tssrc ' + chalk.cyan(cli.flags.config));
		return;
	}
}

if (cli.flags.generate) {
	if (fs.existsSync(localTssrc)) {
		console.error(chalk.red('[ERROR]') + ' .tssrc file already exists in ' + chalk.cyan(cli.flags.projectDir));
		return;
	}

	fs.copySync(defaultTssrc, localTssrc);
	return;
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
	var rawStyle = fs.readFileSync(style, {
			encoding: 'utf8'
		}),
		newStyle = '',
		tmpStyle = [];

	_.each(STYLER.loadStyle(style), function(properties, selector){
		var newProperties = [],
			tmpProperties = [],
			order = tssrc.order.length;

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
				tmp = typef(property, 0, tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = tssrc.indent + tssrc.indent + item;
				});
				newProperties.push(tssrc.indent + property.name + ': ' + '[\n' + tmp.join(',\n') + '\n' + tssrc.indent + ']');
			} else if (_.isObject(property.value)) {
				tmp = typef(property, 0, tssrc);
				_.each(tmp, function(item, index){
					tmp[index] = tssrc.indent + tssrc.indent + item;
				});
				newProperties.push(tssrc.indent + property.name + ': ' + '{\n' + tmp.join(',\n') + '\n' + tssrc.indent + '}');
			} else {
				newProperties.push(tssrc.indent + property.name + ': ' + typef(property, 0, tssrc));
			}
		});
		tmpStyle.push(tssrc.quote + selector + tssrc.quote + ': {\n' + newProperties.join(',\n') + '\n}');
	});

	newStyle = tmpStyle.join(tssrc.concatenation_comma ? ',\n' : '\n');

	var diff;

	if (!tssrc.strip_comment) {
		diff = jsdiff.diffCss(rawStyle, newStyle);

		newStyle = '';
		_.each(diff, function(part){
			if (part.removed &&
				part.value.match(/\/\*[\s\S]*?\*\/|\/\/.*/g)) {
				newStyle += part.value;
			} else if (!part.removed) {
				newStyle += part.value;
			}
		});
	}

	newStyle += tssrc.eof;

	if (cli.flags.diff) {
		console.info(chalk.cyan(style));

		diff = jsdiff.diffCss(rawStyle, newStyle);
		_.each(diff, function(part){
			var color = part.added ? 'green' : part.removed ? 'bgRed' : 'gray';
			process.stdout.write(chalk[color](part.value));
		});
	} else if (cli.flags.dryrun) {
		verbose(style, newStyle);
	} else {
		fs.writeFileSync(style, newStyle);
		cli.flags.verbose && verbose(style, newStyle);
	}
});

function verbose(path, tss) {
	console.info('\n' + chalk.cyan(path));
	console.info(tss);
}