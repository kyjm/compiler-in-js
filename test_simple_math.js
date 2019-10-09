const Parser = require("./src/simple_math_parser");

const sourceCode = `
  x+y*(5+6)
`;
const parser = new Parser();
const ast = parser.parse(sourceCode);
console.log(JSON.stringify(ast, null, 2));
