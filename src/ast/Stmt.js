const Symbols = require('../Symbols')
const LexicalScope = require('./LexicalScope')

class Stmt {
  buildLexicalScope(parent) {
    this.lexicalScope = parent
  }
}

class DeclareStmt extends Stmt{
  constructor(left, right, isCreate = false){
    super()
    this.left = left
    this.right = right
    this.isCreate = isCreate
  }

  buildLexicalScope(parent) {
    this.lexicalScope = parent
    this.lexicalScope.bind(this.left.value)
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

class Block{

  constructor(stmts){
    this.stmts = stmts
  }

  buildLexicalScope(parent, create = true) {
    if(create) {
      this.lexicalScope = new LexicalScope() 
      parent.add(this.lexicalScope)
    }else {
      this.lexicalScope = parent
    }
    
    this.stmts.forEach(stmt => {
      if (stmt instanceof Stmt) {
        stmt.buildLexicalScope(this.lexicalScope)
      } else {
        stmt.bindLexicalScope(this.lexicalScope)
      }
    })
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

class Program extends Block{
  constructor(stmts){
    super(stmts)
  }

  registerGlobals(scope){
    scope.bind('print', 'function')
  }

  buildLexicalScope(parent) {
    this.lexicalScope = new LexicalScope()
    this.registerGlobals(this.lexicalScope)
    parent && parent.add(this.lexicalScope)
    this.stmts.forEach(stmt => {
      if(stmt instanceof Stmt) {
        stmt.buildLexicalScope(this.lexicalScope)
      }else {
        stmt.bindLexicalScope(this.lexicalScope)
      }
    })
  }
}


class IfStmt extends Stmt{
  /**
   * @param {*} expr if 后面的表达式
   * @param {*} ifBlock  if 后面的紧跟着的 Block
   * @param {*} elseIfStmt 如果有else if， 相当于else后面跟着的If语句
   * @param {*} elseBlock 如果没有else if 相当于else后面跟着的Block
   */
  constructor(expr, ifBlock, elseIfStmt, elseBlock) {
    super()
    this.expr = expr
    this.ifBlock = ifBlock
    this.elseIfStmt = elseIfStmt
    this.elseBlock = elseBlock
  }

  buildLexicalScope(parent) {
    super.buildLexicalScope(parent)
    this.expr.bindLexicalScope(this.lexicalScope)
    this.ifBlock.buildLexicalScope(this.lexicalScope)
    this.elseIfStmt && this.elseIfStmt.buildLexicalScope(this.lexicalScope)
    this.elseBlock && this.elseBlock.buildLexicalScope(this.lexicalScope)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'if')
    this.expr.print(level+1)
    this.ifBlock.print(level + 1)
  }
}

class ReturnStmt extends Stmt{
  constructor(expr){
    super()
    this.expr = expr
  }

  buildLexicalScope(parent) {
    super.buildLexicalScope(parent)
    this.expr.bindLexicalScope(this.lexicalScope)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'return' )
    this.expr.print(level+1)

  }
}

class Function extends Stmt{
  constructor(id, args, block) {
    super()
    this.id = id
    this.args = args
    this.block = block
  }

  buildLexicalScope(parent) {
    this.lexicalScope = new LexicalScope()
    parent.add(this.lexicalScope)
    parent.bind(this.id.value)  
    this.args.bindLexicalScope(this.lexicalScope)
    this.block.buildLexicalScope(this.lexicalScope, false)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'function:' + this.id)
    this.args.print(level+1)
    this.block.print(level + 1)
  }

  *gen() {

  }
}


module.exports = {
  DeclareStmt,
  Program,
  Block,
  Function,
  IfStmt,
  ReturnStmt
}