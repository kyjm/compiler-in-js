const Symbols = require('../Symbols')
const LexicalScope = require('./LexicalScope')
const ILGen = require('../gen/ILGen')

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
    this.lexicalScope.bind(this.left.value, 'number')
  }


  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + '=')
    this.left && this.left.print(level + 1)
    this.right && this.right.print(level + 1)
  }

  *gen(il,scope) {
    if(this.right.gen) {
      yield * this.right.gen(il, this.lexicalScope)
    }    
    yield `${this.lexicalScope.getLexemeName(this.left.value)} = ${this.right.rvalue()}`
  }

}

class Block{

  constructor(stmts){
    this.stmts = stmts
  }

  buildLexicalScope(parent, create = true) {
    if(create) {
      this.lexicalScope = new LexicalScope(parent)       
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
  gen(il){
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].gen(il, this.lexicalScope)
    }
  }
}

class Program extends Block{
  constructor(stmts){
    super(stmts)
    this.ilGen = new ILGen()
  }

  registerGlobals(scope){
    scope.bind('print', 'function')
  }

  buildLexicalScope() {
    this.lexicalScope = new LexicalScope()
    this.registerGlobals(this.lexicalScope)
    this.stmts.forEach(stmt => {
      if(stmt instanceof Stmt) {
        stmt.buildLexicalScope(this.lexicalScope)
      }else {
        stmt.bindLexicalScope(this.lexicalScope)
      }
    })
  }

  gen(){
    this.ilGen.beginSection('main')
    for(let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].gen(this.ilGen, this.lexicalScope)
    }
    this.ilGen.endSection()
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

  gen(il) {
    this.expr.gen(il,this.lexicalScope)

    const ifCodeLine = il.add('')
    let ifBlockNextLineNo = null
    this.ifBlock.gen(il,this.lexicalScope)

    if(this.elseIfStmt) {
      if(!ifBlockNextLineNo){
        ifBlockNextLineNo = il.current().lineno
      }
      this.elseIfStmt.gen(il,this.lexicalScope)
    }
    else if(this.elseBlock) {
      if(!ifBlockNextLineNo){
        ifBlockNextLineNo = il.current().lineno
      }
      this.elseBlock.gen(il,this.lexicalScope)
    }

    ifCodeLine.code = `branch ${this.expr.rvalue()} ${ifCodeLine.lineno+1} ${il.current().lineno}`
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

  gen(il){
    this.expr && this.expr.gen && this.expr.gen(il,this.lexicalScope)
    il.add(`return ${this.lexicalScope.getLexemeName(this.expr.rvalue())}`)
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
    this.lexicalScope = new LexicalScope(parent)   
    parent.bind(this.id.value, 'function')  
    this.args.bindLexicalScope(this.lexicalScope)
    this.block.buildLexicalScope(this.lexicalScope, false)
  }

  print(level) {
    const pad = ''.padStart(level * 2)
    console.log(pad + 'function:' + this.id)
    this.args.print(level+1)
    this.block.print(level + 1)
  }

  gen(il) {
    il.add(`declare function ${this.lexicalScope.getLexemeName(this.id.lvalue())}`)
    il.beginSection(this.lexicalScope.getLexemeName(this.id.value))
    this.args.gen(il, this.lexicalScope)
    this.block.gen(il, this.lexicalScope)
    il.endSection()
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