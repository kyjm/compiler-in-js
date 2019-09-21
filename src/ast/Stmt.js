class AssignStmt {
  constructor(left, right){
    this.left = left
    this.right = right
  }
}

class Program{
  constructor(stmts) {
    this.stmts = stmts
  }
}

module.exports = {
  AssignStmt,
  Program
}