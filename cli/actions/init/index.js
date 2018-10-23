const fs = require('fs');
const { range, without } = require('lodash');
const { mkDir } = require('rndm-utils');
const babel = require('babel-core');
const generator = require('babel-generator');

const isRNDMPlugin = require('../../utils/isRNDMPlugin');
const isRNDMPreset = require('../../utils/isRNDMPreset');

const current = process.cwd();

const init = (cmd = {}) => {
  const relativity = range(cmd.node ? 2 : 0).map(() => '..').join('/');
  const project = [current, relativity].filter(Boolean).join('/');
  const src = [project, 'src'].filter(Boolean).join('/');
  const nodeModules = [project, 'node_modules'].filter(Boolean).join('/');
  const supporting = [project, '_supporting'].filter(Boolean).join('/');
  const nodes = fs.readdirSync(nodeModules);
  const presets = nodes.filter(isRNDMPreset);
  const plugins = nodes.filter(isRNDMPlugin);
  const exclusions = [];
  const imports = [];

  const rewire = [supporting, 'rewire_modules.json'].join('/');
  const rndmRender = 'rndm-render';

  if (!fs.existsSync(rewire)) {
    mkDir(supporting);
    fs.writeFileSync(rewire, JSON.stringify([rndmRender], null, 2));
  }else {
    const array = JSON.parse(fs.readFileSync(rewire).toString());
    if (!array.includes(rndmRender)) {
      array.push(rndmRender);
    }
    fs.writeFileSync(rewire, JSON.stringify(array, null, 2));
  }

  presets.forEach(preset => {
    const packageFile = [nodeModules, preset, 'package.json'].join('/');
    const { dependencies } = JSON.parse(fs.readFileSync(packageFile).toString());
    const nodes = Object.keys(dependencies);
    const plugins = nodes.filter(isRNDMPlugin);
    plugins.forEach(p => exclusions.push(p));
    imports.push(preset)
    const cliFile = [nodeModules, preset, 'cli', 'index.js'].join('/');
    if (fs.existsSync(cliFile)) {
      const cli = require(cliFile)
      if (cli && cli.init) cli.init({ node: cmd.node })
    }
  });

  const remaining = without(plugins, ...exclusions);

  remaining.forEach(p => imports.push(p));

  plugins.forEach(plugin => {
    const cliFile = [nodeModules, plugin, 'cli', 'index.js'].join('/');
    if (fs.existsSync(cliFile)) {
      const cli = require(cliFile);
      if (cli && cli.init) cli.init({ node: cmd.node })
    }
  });

  const pluginFolder = [src, 'app', 'plugins'].join('/');
  mkDir(pluginFolder);

  const pluginFile = [pluginFolder, 'index.js'].join('/');
  if (!fs.existsSync(pluginFile)) {
    fs.writeFileSync(pluginFile, imports.map(r => `import '${r}';`).join('\n') + '\n')
  } else {
    const string = fs.readFileSync(pluginFile).toString();
    const array = string.split('\n');
    const filtered = array.filter(f => f.startsWith('import '));
    const other = array.filter(f => !f.startsWith('import '));

    imports.forEach(i => {
      if (!string.includes(i)) filtered.push(`import '${i}';`)
    });

    filtered.sort(i => i.includes('./') ? 1 : i.includes('-preset-') ? -1 : 0);

    fs.writeFileSync(pluginFile, [...filtered, ...other].join('\n'))
  }

  const file = [src, 'app', 'index.js'].join('/');
  const entry = fs.readFileSync(file).toString();

  if (!entry.includes('import \'./plugins\'')) {

    const options = {
      presets: ['react'],
    };

    const babelified = babel.transform(entry, options);

    const imported = babelified.ast.program.body.filter(i => i.type === 'ImportDeclaration');

    babelified.ast.program.body.splice(imported.length - 1, 0, {
      type: 'ImportDeclaration',
      specifiers: [],
      source: {
        type: 'StringLiteral',
        extra: {
          rawValue: './plugins',
          raw: '\'./plugins\'',
        },
        value: './plugins',
      }
    });

    const { code } = generator.default(babelified.ast, options);

    const jsx = babel.transform(code, {
      plugins: ['transform-react-createelement-to-jsx'],
    });

    fs.writeFileSync(file, jsx.code + '\n')
  }
};

module.exports = init;
