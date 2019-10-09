const { Terminal, Id } = require('./Terminal')

class Expr {
  constructor(op, left, right){
    this.op = op
    this.left = left
    this.right = right
  }

  print(level = 0) {
    const pad = ''.padStart(level * 2)
    console.log(pad + this.op)
    this.left && this.left.print(level + 1)
    this.right && this.right .print(level + 1)

  }

  *gen(symbols){    
    if(this.left.gen) {
      yield * this.left.gen(symbols)
    }
    if(this.right.gen) {
      yield* this.right.gen(symbols)
    }
    // left right 
    this.tmpId = symbols.assign_temp_var()
    const rvalue = this.left.rvalue()
    yield `${this.tmpId} = ${rvalue} ${this.op} ${this.right.rvalue()}`
  }

  rvalue() {
    return this.tmpId
  }

  bindLexicalScope(scope) {
    this.left && this.left.bindLexicalScope && this.left.bindLexicalScope(scope)
    this.right && this.right.bindLexicalScope && this.right.bindLexicalScope(scope)
  }
}

class FunctionCallExpr extends Expr{
  constructor(id, args){
    super('call', id, args)
  }
}

class AssignExpr extends Expr {
  constructor(id, expr) {
    super('=', id, expr)
  }
}

class Args{
  constructor(args, type = 'call') {
    this.args = args
    this.type = type
  }

  print(level) {
    this.args.forEach(x => {
      x.print(level)
    })
  }

  bindLexicalScope(scope) {
    for (let i = 0; i < this.args.length; i++) {
      if (this.type === 'function') {
        scope.bind(this.args[i].value)
        this.args[i].bindLexicalScope(scope)
      } else {
        this.args[i].bindLexicalScope && this.args[i].bindLexicalScope(scope)
      }
    }
  }
}

module.exports = {
  Expr,
  FunctionCallExpr,
  AssignExpr,
  Args
}