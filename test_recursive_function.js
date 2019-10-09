const Parser = require('./src/parser');
const sourceCode = `
function febonacci(n) {
  if(n == 1 || n == 2) {
    return n
  }
  return febonacci(n-1) + febonacci(n-2)
}

print( x + y * (3 +5) == 10 )
print( febonacci(5) )
`;

const parser = new Parser();
const ast = parser.parse(sourceCode);

ast.print();
