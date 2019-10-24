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

  gen(il){    
    // console.log(this.left)
    this.left && this.left.gen && this.left.gen(il)
    this.right && this.right.gen && this.right.gen(il)
    const tempVar = il.requestTempVar()
    il.add(`set ${tempVar} ${this.left.rvalue()}${this.op}${this.right.rvalue()}`)
    this._rval = tempVar;
  }

  rvalue() {
    return this._rval; 
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

  gen(il) {
    this.right.gen(il)
    const tempVar = il.requestTempVar()
    il.add(`${tempVar} = call ${this.left.lvalue()}`)
    this._rval = tempVar
  }
}

class AssignExpr extends Expr {
  constructor(id, expr) {
    super('=', id, expr)
  }

  gen(il) {
    il.add(`declare ${id}`)
    expr.gen(il)
    il.add(`${id}=${expr.rvalue()}`)

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

  gen(il) {
    if(this.type == 'call') {
      for (let i = 0; i < this.args.length; i++) {
        const expr = this.args[i]
        expr.gen && expr.gen(il)
        il.add(`pass ${expr.rvalue()}`)
      }
    }else if(this.type === 'function') {
      for (let i = 0; i < this.args.length; i++) {
        const expr = this.args[i]
        expr.gen && expr.gen(il)
        il.add(`arg ${expr.rvalue()}`)
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