const Symbols = require('../Symbols')
class AssignStmt {
  constructor(left, right){
    this.left = left
    this.right = right
  }

  print(level) {

    const pad = ''.padStart(level * 2)
    console.log(pad + '=')
    this.left && this.left.print(level + 1)
    this.right && this.right.print(level + 1)
  }

  *gen(symbols) {
    if(this.right.gen) {
      yield * this.right.gen(symbols)
    }    
    yield `${this.left.value} = ${this.right.rvalue()}`
  }

}

class Program{
  constructor(stmts) {
    this.stmts = stmts
    this.symbols = new Symbols()
  }

  print() {
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].print(0)
    }
  }

  *gen() {
    for(let i = 0; i < this.stmts.length; i++) {
      yield * this.stmts[i].gen(this.symbols)
    }
  }
}

module.exports = {
  AssignStmt,
  Program


}