const fs = require('fs')
const Parser = require('./src/parser')
const parser = new Parser()

const ipt = process.argv[2]
const opt = process.argv[3]

if(!(ipt && opt)) {
  console.log('用法: node il.js <输入文件> <输出名称(不需要扩展名)>')
  process.exit(-1)
}

const sourceCode = fs.readFileSync(ipt, 'utf-8')
const ast = parser.parse(sourceCode)
const symbols = ast.lexicalScope.toJSON()

ast.gen()
const ils = ast.ilGen.toText()
fs.writeFileSync(opt + '.tss', JSON.stringify(symbols, null, 2), 'utf-8')
fs.writeFileSync(opt + '.tsi', ils, 'utf-8')
console.log('完成')