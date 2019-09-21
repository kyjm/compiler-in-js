const Parser = require('../parser')

const parser = new Parser()

const ast = parser.parse(`
  auto x = 100
  auto y = 200
  auto z = x * (y + 100)  / 10
`)

ast.print()

const ilcode = [...ast.gen()]
ilcode.forEach(item => {
  console.log(item)
})
