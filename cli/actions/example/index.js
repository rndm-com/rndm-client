const fs = require('fs');
const colors = require('colors');
const { range } = require('lodash');
const { readDir } = require('rndm-utils');
const babel = require('babel-core');
const generator = require('babel-generator');
const createExample = require('./createExample');
const isRNDMPlugin = require('../../utils/isRNDMPlugin');
const isRNDMPreset = require('../../utils/isRNDMPreset');

const current = process.cwd();

const example = (cmd = {}) => {
  const relativity = range(cmd.node ? 2 : 0).map(() => '..').join('/');
  const src = [current, relativity, 'src'].filter(Boolean).join('/');
  const nodeModules = [current, relativity, 'node_modules'].filter(Boolean).join('/');
  const nodes = fs.readdirSync(nodeModules);
  const aggregated = nodes.filter(node => isRNDMPreset(node) || isRNDMPlugin(node));
  const examplePath = 'examples';
  const available = aggregated.reduce((o, i) => {
    const path = [nodeModules, i, examplePath].join('/');
    if (!fs.existsSync(path)) return o;
    const files = readDir(path).filter(i => i.endsWith('.json')).map(i => i.split('/').pop().replace('.json', ''));
    if (files.length === 0) return o;
    o[i] = files;
    return o;
  }, {'all': 'all'});

  if (!cmd.package || !available[cmd.package]) {

    console.log(cmd)

    const message = `
${'Invalid Package Selected'.red} 
Available options are: \n${Object.keys(available).map(i => `--> ${i.green}`).join('\n')}

Please run this again and select a package with the option -p --package
`;
    console.log(message);
  } else {
    if (cmd.package === 'all') {
      const packages = Object.keys(available).filter(i => i !== 'all');
      packages.forEach(p => {
        const templates = available[p]
        templates.forEach(t => createExample(p, t, nodeModules))
      })
    } else if (available[cmd.package] && !cmd.template) {
      const pkg = available[cmd.package];
      const message = `
${'Invalid Template Selected'.red}
Available options are: \n${Object.keys(pkg).map(i => `--> ${i.green}`).join('\n')}

Please run this again and select a template with the option -t --template
`;
      console.log(message);
    } else {
      if (cmd.template === 'all') {
        const pkg = cmd.package;
        const templates = available[pkg];
        templates.forEach(t => createExample(pkg, t, nodeModules));
      } else {
        const pkg = cmd.package;
        const template = cmd.template;

        createExample(pkg, template, nodeModules)
      }
    }
  }
};

module.exports = example;
