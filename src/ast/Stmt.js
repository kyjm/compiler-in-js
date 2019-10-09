const Symbols = require('../Symbols');
class AssignStmt {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  print(level) {
    const pad = ''.padStart(level * 2);
    console.log(pad + '=');
    this.left && this.left.print(level + 1);
    this.right && this.right.print(level + 1);
  }

  *gen(symbols) {
    if (this.right.gen) {
      yield* this.right.gen(symbols);
    }
    yield `${this.left.value} = ${this.right.rvalue()}`;
  }
}

class Program {
  constructor(stmts) {
    this.stmts = stmts;
    this.symbols = new Symbols();
  }

  print() {
    for (let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].print(0);
    }
  }

  *gen() {
    for (let i = 0; i < this.stmts.length; i++) {
      yield* this.stmts[i].gen(this.symbols);
    }
  }
}

class Block {
  constructor(stmts) {
    this.stmts = stmts;
  }

  print(level) {
    for (let i = 0; i < this.stmts.length; i++) {
      this.stmts[i].print(level);
    }
  }

  *gen() {}
}

class IfStmt {
  constructor(expr, ifBlock, ifStmt, elseBlock) {
    this.expr = expr;
    this.ifBlock = ifBlock;
    this.ifStmt = ifStmt;
    this.elseBlock = elseBlock;
  }

  print(level) {
    const pad = ''.padStart(level * 2);
    console.log(pad + 'if');
    this.expr.print(level + 1);
    this.ifBlock.print(level + 1);
  }
}

class ReturnStmt {
  constructor(expr) {
    this.expr = expr;
  }

  print(level) {
    const pad = ''.padStart(level * 2);
    console.log(pad + 'return');
    this.expr.print(level + 1);
  }
}

class Function {
  constructor(id, args, block) {
    this.id = id;
    this.args = args;
    this.block = block;
  }

  print(level) {
    const pad = ''.padStart(level * 2);
    console.log(pad + 'function:' + this.id);
    this.args.print(level + 1);
    this.block.print(level + 1);
  }

  *gen() {}
}

class FunctionCallStmt {
  constructor(id, args) {
    this.id = id;
    this.args = args;
  }

  print(level) {
    const pad = ''.padStart(level * 2);
    console.log(pad + `${this.id}()`);
    this.args.print(level + 1);
  }
}

module.exports = {
  AssignStmt,
  Program,
  Block,
  Function,
  IfStmt,
  ReturnStmt,
  FunctionCallStmt
};
