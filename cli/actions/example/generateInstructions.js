const fs = require('fs');
const colors = require('colors');

const current = process.cwd();

const generateInstructions = (examples, view, json, src) => (
  `
--------------------------------------------
-----------  ${'TEMPLATE INSTALLED'.green}  -----------
--------------------------------------------

To access this template go to:
${examples.green.italic.bold}

You can import the example directly into your React code by importing:
${`PROJECT_FOLDER${view.substring(current.length)}`.green.italic.bold}

${'EXAMPLE CODE'.bold}:

${`import Example from '.${view.substring(src.length)}'; // This would a relative path to the example file

const SomeComponent = (props) => (
  <Example />
);`.blue.italic}

Try editing the associated JSON file to see how this results in your code. You can find this at:
${`PROJECT_FOLDER${json.substring(current.length)}`.green.italic.bold}

Have fun and happy coding!

--------------------------------------------
`
);

module.exports = generateInstructions;
