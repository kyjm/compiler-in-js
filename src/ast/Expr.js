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

  gen(il,scope){    
    // console.log(this.left)
    this.left && this.left.gen && this.left.gen(il,scope)
    this.right && this.right.gen && this.right.gen(il,scope)
    const tempVar = scope.bindTempVar()
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

  gen(il,scope) {
    this.right.gen(il,scope)    
    const tempVar = scope.bindTempVar()
    il.add(`${tempVar} = call ${scope.getLexemeName(this.left.lvalue())}`)
    this._rval = tempVar
  }
}

class AssignExpr extends Expr {
  constructor(id, expr) {
    super('=', id, expr)
  }

  gen(il,scope) {
    il.add(`declare ${scope.getLexemeName(id.lvalue())}`)
    expr.gen(il,scope)
    il.add(`${scope.getLexemeName(id.lvalue())}=${expr.rvalue()}`)

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

  gen(il,scope) {
    if(this.type == 'call') {
      for (let i = 0; i < this.args.length; i++) {
        const expr = this.args[i]
        expr.gen && expr.gen(il,scope)
        il.add(`pass ${expr.rvalue()}`)
      }
    }else if(this.type === 'function') {
      for (let i = 0; i < this.args.length; i++) {
        const expr = this.args[i]
        expr.gen && expr.gen(il,scope)
        il.add(`arg ${scope.getLexemeName(expr.rvalue())}`)
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