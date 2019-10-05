const { Expr } = require('./ast/Expr')

const PRIORITY_TABLE = {
  '+' : 60,
  '-' : 60,
  '*' : 70,
  '/' : 70,
  '>=' : 80,
  '<=' : 80,
  '>' : 80,
  '<' : 80,
  '&&' : 90,
  '||' : 90,
  '==' : 100,
  '!=' : 100,
  '(' : 1000, // 用不到
  ')' : 1000
}

function popUntil(stack, prediction, callback) {
  let v = null
  while( v = stack.pop() ) {
    if(prediction(v)) {
      stack.push(v)
      break
    }
    callback(v)
  }
}

function parseExpr(parser) {
  if(parser.lookahead.value === ')') {
    return null
  }
  const postOrderOutput = inOrderToPostOrder.call(parser)  
  return constructAST(postOrderOutput)

}

function constructAST(postOrderOutput) {

  let c = null
  const stack = []
  for(let i = 0; i < postOrderOutput.length; i++) {
    const c = postOrderOutput[i]
    if(c.type === 'op') {
      const r = stack.pop()
      const l = stack.pop()
      const expr = new Expr(c.value, l, r)
      stack.push(expr)
    } else {
      stack.push(c)
    }
  }
  return stack[0]
}

function inOrderToPostOrder() {
  const opStack = []        
  const output = []

  while(this.lookahead.value != 'eof' && this.lookahead.value !== '}') {    

    if(this.lookahead.value === '(') {
      opStack.push(this.lookahead)    
      this.match('(')
    }
    else if(this.lookahead.value === ')') { 
      popUntil(opStack, x => x.value === '(', x => {
        output.push(x)
      })
      const op = opStack.pop()
      if(!op || op.value !== '(') {
        break
      }

      this.match(')')
      if(this.lookahead.type != 'op'){
        break
      }
    } else if(this.lookahead.type === 'op') {
      const op = this.lookahead
      if( !(op.value in PRIORITY_TABLE) ) {
        throw `An operator expected in @line ${this.lookahead.lineno} but ${this.lookahead.value} found`
      }
      this.match(op.value)
      const lastOp = opStack[opStack.length - 1]
      if(!lastOp) { // opStack是空的
        opStack.push(op)
      }
      else {
        if(PRIORITY_TABLE[op.value] <= PRIORITY_TABLE[lastOp.value]) {
          popUntil(opStack, x => !x || x.value === '(', x => {
            output.push(x)
          }) 
        }
        opStack.push(op)
      }
      
    }else {
      const factor = this.parseFactor()
      output.push(factor)
      if(this.lookahead.type != 'op' || this.lookahead.value === '=') {
        break
      }
    }
  }

  if(opStack.length > 0) {
    while(opStack.length > 0) {
      output.push(opStack.pop())
    }
  } 

  return output
}


module.exports = parseExpr