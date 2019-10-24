class ILGen {

  constructor(){
    this.codeLines = []  
    this.lineno = 0
    this.tempVarId = 1
  }

  add(code) {
    const obj = {
      lineno : this.lineno++,
      code
    }
    this.codeLines.push(obj)
    return obj
  }

  nextLineNo() {
    return this.lineno;
  }

  requestTempVar() {
    return `temp${this.tempVarId++}`
  }

  print() {
    this.codeLines.forEach(line => {
      console.log(`${line.lineno}: ${line.code}`)
    })
  }


}

module.exports = ILGen