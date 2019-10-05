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
    if(this.left.gen) {
      yield * this.left.gen(symbols)
    }
    if(this.right.gen) {
      yield* this.right.gen(symbols)
    }
    // left right 
    this.tmpId = symbols.assign_temp_var()
    const rvalue = this.left.rvalue()
    yield `${this.tmpId} = ${rvalue} ${this.op} ${this.right.rvalue()}`
  }

  rvalue() {
    return this.tmpId
  }
}


class Args{
  constructor(args) {
    this.args = args
  }

  print(level) {
    this.args.forEach(x => {
      x.print(level)
    })
  }
}

module.exports = {
  Expr,
  Args
}