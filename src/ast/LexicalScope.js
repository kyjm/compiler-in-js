let scopeId = 1
class LexicalScope {
  constructor(){
    this.id = scopeId ++
    this.table = {}
    this.children = []
  }

  add(subScope) {
    subScope.parent = this
    this.children.push(subScope)
  }

  lookup(id) {

    let p = this
    while(p) {
      if( p.table[id] ) {
        return p
      }
      p = p.parent
    }
    return null
  }

  bind(id, type = 'number') {
    this.table[id] = {
      type
    }
  }

  print(level = 0) {

    const pad = ''.padStart(level * 2)
    console.log(`${pad}scope ${this.id}\n${pad}{`)
    for(let key in this.table) {
      console.log(`${pad}  ${key} : ${this.table[key].type}`)
    }
    this.children.forEach(child => {
      child.print(level + 1)
    })
    console.log(`${pad}}`)


  }
}

module.exports = LexicalScope