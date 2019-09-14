const lexer = require('./lexer')
// E -> E + T | E - T | T
// E -> TE'
// E' -> +E | -E | e 

// T -> (E) | T * L | T / L | L
// T -> LT' | (E) 
// T' -> *T | /T | e

class Parser{
  constructor(){
    this.index = 0
  }

  eat(value) {
    const token = this.tokens[this.index]
    if(token.value !== value) {
      throw 'syntax error'
    }
    this.index ++
  }

  parse(sourceCode){
    this.tokens = lexer(sourceCode)
    this.index = 0
    return this.parseExpr()
  }

  parseExpr() {
    const term = this.parseTerm()
    const expr = this.parseExprR()
  
    if (expr) {
      return {
        left: term,
        ...expr
      }
    } else {
      return term
    }
  }
  
  parseExprR(){
    const token = this.tokens[this.index]
    if( token && (token.value === '+' || token.value === '-')){
      this.eat(token.value)
      const expr = this.parseExpr()
      return {
        op : token.value,
        right : expr
      }
    }
    return null
  }
  
  parseTerm(){
    const token = this.tokens[this.index]
    if(token.value === '(') {
      console.log('here')
      this.eat('(')
      const expr = this.parseExpr()
      this.eat(')')
      return expr
    }
    else {
      const literal = this.parseLiteral()      
      const term = this.parseTermR() 
      if(term) {
        return {
          left: literal,
          ...term
        }
      } else {
        return literal
      }
    }
  }
  
  parseTermR(){
    const token = this.tokens[this.index]
  
    if(token && (token.value === '*' || token.value === '/')){
      this.eat(token.value)
      const term = this.parseTerm()
      return {
        op : token.value,
        right : term
      }
    }
    return null
  }
  
  parseLiteral() {
    const token = this.tokens[this.index]
  
    if(token.type === 'id' ){
      this.eat(token.value)
      return {
        type : 'id',
        id : token.value
      }
    }else if(token.type === 'number'){
      this.eat(token.value)
      return {
        type : 'number',
        value : token.value
      }
    }else {
      throw 'syntax error'
    }
  }
  
  
}



module.exports = Parser