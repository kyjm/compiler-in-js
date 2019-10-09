class Factor {
  constructor(value) {
    this.value = value
  }

  lvalue() {
    return this.value
  }

  rvalue() {
    return this.value
  }

  print(level) {
    console.log(''.padStart(level * 2) + this.value)
  }

}


class Id extends Factor{
  bindLexicalScope(scope) {
    this.scope = scope.lookup(this.value)
    if(this.scope === null) {
      throw `undefined variable ${this.value}`
    }
  }
}

class Numeral extends Factor{}

module.exports = {
  Id,
  Numeral
}