const lexer = require('./lexer')

const { Program, AssignStmt } = require('./ast/Stmt')
const { Expr } = require('./ast/Expr')
const { Id, Numeral } = require('./ast/Terminal')
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
    throw `syntax error : expect ${value} here but ${this.lookahead.value} found.`
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

  parseStmts() {
    const stmts = []
    while(this.lookahead.type !== 'eof') {
      stmts.push ( this.parseStmt() )
    }
    return stmts
  }

  parseStmt() {

    switch(this.lookahead.value) {
      case 'auto' :
        return this.parseAssignStmt()
      default :
        throw 'not impl.'
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

  /**
   * Expr -> Expr + Term | Expr - Term | Term
   * Term -> -Expr | (Expr) | Term * factor | Term / factor | factor
   * factor -> number | string | id
   * 
   * r : Expr -> Term Expr_ 
   */
  parseExpr() {
    const term = this.parseTerm()
    const rexpr = this.parseExpr_()
    if(rexpr === null) {return term}
    else {return new Expr(rexpr.op, term, rexpr.expr)}
  }

  /**
   * Expr_ -> + Expr | - Expr | ϵ
   */
  parseExpr_() {
    if(this.lookahead.value === '+' || this.lookahead.value === '-') {
      const value = this.match(this.lookahead.value)
      return {op : value, expr : this.parseExpr()}
    }
    return null
  }
  
  /**
   * Term -> -Expr Term_ | (Expr) Term_ | factor Term_ 
   */
  parseTerm() {
    let left = null
    if(this.lookahead.value === '-') {
      this.match('-')
      left = new Expr('-', this.parseExpr())
    }
    else if(this.lookahead.value === '(') {
      this.match('(')
      const expr = this.parseExpr()
      this.match(')')
      left = expr
    } else {
      left = this.parseFactor()
    }
    

    const rterm = this.parseTerm_()
    if(rterm === null) {
      return left
    }
    return new Expr(rterm.op, left, rterm.expr)

  }

  /**
   * Term_ -> * Term | / Term | ϵ
   */
  parseTerm_() {

    if(this.lookahead.value === '*' || this.lookahead.value === '/') {
      const value = this.match(this.lookahead.value)
      return {op : value, expr : this.parseTerm()}
    }
    return null
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
      return new Id(value)
    }else if (this.lookahead.type === 'string') {
      throw 'not impl.'
    }else{
      throw 'syntax error'
    }
  }

}

module.exports = Parser