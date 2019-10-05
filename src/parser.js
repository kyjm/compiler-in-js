const lexer = require('./lexer')

const { Program, AssignStmt, Function, Block, IfStmt, ReturnStmt, FunctionCallStmt } = require('./ast/Stmt')
const { Expr, Args } = require('./ast/Expr')
const { Id, Numeral } = require('./ast/Terminal')
const exprParser = require('./exprParser')

/**
 * 自顶部向下递归+lookahead一个token的parser
 * Program -> Stmts
 * Stmts -> Stmt Stmts | ϵ
 * S
 */
class Parser {
  parse(sourceCode){
    this.tokens = lexer(sourceCode)

    // 增加一个哨兵，用于判断结尾
    this.tokens.push({type : 'eof', value : null})
    this.index = 0
    this.lookahead = this.tokens[this.index++]

    return this.parseProgram()
  }

  read(){

    if(this.lookahead.type !== 'eof') {
      this.lookahead = this.tokens[this.index++]
    }    
  }

  match(value) {
    if(this.lookahead.value === value) {
      this.read()
      return value
    }
    throw `syntax error @line ${this.lookahead.lineno} : expect ${value} here but ${this.lookahead.value} found.`
  }

  matchType(type) {
    if(this.lookahead.type === type) {
      this.read()
    }
    throw 'syntax error'
  }

  /**
   * Program -> Stmts 
   */
  parseProgram() {
    return new Program(this.parseStmts())
  }

  /**
   * Stmts -> Stmt Stmts | ϵ
   */
  parseStmts() {
    const stmts = []
    while(this.lookahead.type !== 'eof' && this.lookahead.value !== '}') {
      stmts.push ( this.parseStmt() )
    }
    return stmts
  }

  /**
   * Stmt -> AssignStmt | IfStmt | WhileStmt | Function | Block | ...
   * AssignStmt -> auto <id> = Expr
   * IfStmt -> if Expr Block else IfStmt | if Expr Block | Stmt
   * 
   */
  parseStmt() {

    if(this.lookahead.type=== 'id' || this.lookahead.type === 'number') { // 表达式
      return this.parseExpr()
    }

    switch(this.lookahead.value) {
      case 'auto' :
        return this.parseAssignStmt()
      case 'function':
        return this.parseFunctionStmt()
      case 'if':
        return this.parseIfStmt()
      case 'return':
        return this.parseReturnStmt()
      default :
        console.log(this.lookahead)
        throw `syntax error @line ${this.lookahead.lineno} : not impl. ${this.lookahead.value}`
    }

  }

  parseBlock() {
    this.match('{')
    const stmts = this.parseStmts()
    this.match('}')
    return new Block(stmts)
  }



  /**
   * FunctionStmt -> function {id}(...ARGS) BLOCK
   */
  parseFunctionStmt(){
    this.match('function')
    if(this.lookahead.type !== 'id') {
      throw 'syntax error'
    }
    const id = this.lookahead.value
    this.match(id)

    this.match('(')
    const args = this.parseFuncArguments()
    this.match(')')

    const block = this.parseBlock()
    return new Function(id, args, block)
  }

  /**
   * ReturnStmt -> return Expr
   */
  parseReturnStmt() {
    this.match('return')
    const expr = this.parseExpr()
    return new ReturnStmt(expr)
  }

  /**
   * Args -> <id> | <id>,Args | ϵ
   */
  parseFuncArguments() {
    let list = []
    if(this.lookahead.type === 'id') {
      const id = this.lookahead.value
      this.match(id)
      list.push(new Id(id))
      if(this.lookahead.value === ',') {
        this.match(',')
        list = list.concat(this.parseFuncArguments())
      }
    } else {
      return []
    }
    return new Args(list)
  }

  parseArguments() {
    let list = []
    let expr = null
    while( (expr = this.parseExpr()) ) {
      list.push(expr)
    }
    return new Args(list)
  }

  /**
   * IfStmt -> if Expr Block | if Expr Block else IfStmt | if Expr Block else Block
   */
  parseIfStmt() {
    this.match('if')
    const expr = this.parseExpr()
    const ifBlock = this.parseBlock()
    
    if(this.lookahead.value === 'else') {
      this.match('else')
      
      if(this.lookahead.value === 'if') {
        const ifStmt = this.parseIfStmt()
        return new IfStmt(expr, ifBlock, ifStmt)
      }
      else {
        const elseBlock = this.parseBlock()
        return new IfStmt(expr, ifBlock, null, elseBlock)
      }
    }else {
      return new IfStmt(expr, ifBlock)
    }
  }

  /**
   * AssignStmt -> auto id = expr
   */
  parseAssignStmt() {
    

    this.match('auto')
    if(this.lookahead.type !== 'id'){
      throw 'syntax error'
    }    
    const id = new Id(this.lookahead.value)

    this.match(this.lookahead.value)
    this.match('=')
    const right = this.parseExpr()
    return new AssignStmt(id, right)
  }

  parseExpr() {
    return exprParser(this)
  }

  /**
   * factor -> number | string | id
   */
  parseFactor() {
    if(this.lookahead.type === 'number') {
      const value = this.match(this.lookahead.value)
      return new Numeral(value)
    }
    else if(this.lookahead.type === 'id') {
      const value = this.match(this.lookahead.value)

      if(this.lookahead.value=== '(') {
        this.match('(')
        const args = this.parseArguments()
        this.match(')')
        return new FunctionCallStmt(value, args)
      }
    
      return new Id(value)
    }else if (this.lookahead.type === 'string') {
      throw 'not impl.'
    }else{
      throw `syntax error, expect a factor but ${this.lookahead.value} found`
    }
  }

}

module.exports = Parser