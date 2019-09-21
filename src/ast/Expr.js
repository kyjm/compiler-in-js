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
    this.tmpId = symbols.assign_temp_var()
    if(this.left.gen) {
      yield * this.left.gen(symbols)
    }
    if(this.right.gen) {
      yield* this.right.gen(symbols)
    }
    const lvalue = this.left.lvalue()
    yield `${this.tmpId} = ${lvalue} ${this.op} ${this.right.rvalue()}`
  }

  lvalue(){
    return this.tmpId
  }

  rvalue() {
    return this.tmpId
  }
}


module.exports = {
  Expr
}