const lexer = require('../lexer');

const tokens = lexer(`
  auto x = 100.00
  auto y = 200.00
  auto z = x + y * (100 + x)
`);

console.log(tokens);
