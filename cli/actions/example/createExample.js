const fs = require('fs');
const { mkDir } = require('rndm-utils');
const generateInstructions = require('./generateInstructions');
const current = process.cwd();

const createExample = (pkg, template, nodeModules) => {
  const jsonFilename = `${template}.json`;
  const viewFilename = `${template}.js`;
  const string = fs.readFileSync([nodeModules, pkg, 'examples', jsonFilename].join('/')).toString();
  const src = [current, 'src'].filter(Boolean).join('/');
  const examples = [src, 'app', 'rndm_examples', pkg].join('/');
  const jsons = [examples, 'json'].join('/');
  const views = [examples, 'views'].join('/');

  mkDir(jsons);
  mkDir(views);

  const json = [jsons, jsonFilename].join('/');
  const view = [views, viewFilename].join('/');
  if (!fs.existsSync(json)) fs.writeFileSync(json, string);
  if (!fs.existsSync(view)) {
    const js = `import { render } from 'rndm-render';
import views from '../json/${jsonFilename}';

const Example = () => render(views);

export default Example;
`;
    fs.writeFileSync(view, js);
  }

  console.log(generateInstructions(examples, view, json, src))
};

module.exports = createExample;
