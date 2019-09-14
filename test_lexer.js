const lexer = require('./src/lexer')
const sourceCode = `
  x+y*(5+6)
`

console.log( JSON.stringify(lexer(sourceCode)))