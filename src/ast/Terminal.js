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

class Id extends Factor{}

class Numeral extends Factor{}

module.exports = {
  Id,
  Numeral
}