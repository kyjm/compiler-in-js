const lexer = require('./lexer')

const { Program, AssignStmt } = require('./ast/Stmt')
const { Id } = require('./ast/Terminal')
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
    this.lookahead = this.tokens[this.index]

    return this.parseProgram()
  }

  read(){
    if(this.lookahead.type !== 'eof') {
      this.lookahead = this.tokens[++this.index]
    }
  }

  match(val) {
    if(this.lookahead.val === val) {
      this.read()
    }
    throw 'syntax error'
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
    return new Program(this.parseStmts)
  }

  parseStmts() {
    const stmts = []
    while(this.lookahead.type !== 'eof') {
      stmts.push ( this.parseStmt() )
    }
    return stmts
  }

  parseStmt() {

    switch(this.lookahead.val) {
      case 'auto' :
        return this.parseAssignStmt()
        break
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
    const id = new Id(this.lookahead.val)
    const right = this.parseExpr()
    return new AssignStmt(id, right)
  }

  /**
   * Expr -> Expr + Term | Expr - Term | Term
   * Term -> -Expr | (Expr) | Term * factor | Term / factor | factor
   * factor -> number | string | id
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
    if(this.lookahead.type === 'eof') {
      return null
    }

    if(this.lookahead.val === '+' || this.lookahead.val === '-') {
      this.match(this.lookahead.val)
      return {op : this.lookahead.val, expr : this.parseExpr_()}
    }
    throw 'syntax error'
  }
  
  /**
   * Term -> -Expr | (Expr) | factor Term_ 
   */
  parseTerm() {
    const factor = this.parseFactor()
    const {op, expr} = this.parseTerm_()
  }

  parseTerm_() {

  }


  parseFactor() {
    if(this.lookahead.type === 'number') {
      return Number(this.lookahead.val)
    }
    else if(this.lookahead.type === 'id') {
      return Id(this.lookahead.val)
    }else{
      throw 'syntax error'
    }
  }

}