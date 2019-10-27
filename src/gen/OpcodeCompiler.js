class OpcodeCompiler {

  constructor(){
    this.symbolsHash = {}
    this.scopeHash = {}
  }

  offset(register, lexeme, argc = 0) {

    if(lexeme.index < argc) {
      return `${register}+${4 * (argc - lexeme.index + 1)}`
    }
    else if(lexeme.index > argc) {
      return `${register}-${4 * (lexeme.index-1)}`
    }
    else {
      return `${register}`
    } 
  }

  addr(curScope, x, register = 'R0') {

    // 数字
    if(x[0].match(/[0-9]/)) { 
      return '#'+x
    }  
    else if(x.indexOf('%') !== -1) {
      return x.replace(/%/g, '')
    }
    else {
      // const argc = currentScop
      // console.log(curScope, curScope.children[0].table)
      const argc = curScope.type === 'function' ? 
        curScope.argc : 0
        
      const lexeme = curScope.find(x)
      // 分case讨论
      // case1: 变量在当前作用域
      // case2：变量不在当前作用域
      //   case3: 当前作用域是变量作用域的子节点
      //   case4: 当前作用域不是变量作用域的子节点
      if (curScope.id === lexeme.scopeId) {
        return `${this.offset('TOP', lexeme, argc)}`
      } else {
        if (curScope.isParent(lexeme.scopeId)) {
          const levelDiff = curScope.level - lexeme.level
          this.lines.push(`mov TOP ${register}`)
          for (let i = 0; i < levelDiff; i++) {
            this.lines.push(`mov @${register} ${register}`)
          }
          this.lines.push(`mov ${this.offset(register, lexeme, argc)} ${register}`)
        } else {
          // 这种情况下TOP肯定指向父作用域
          this.lines.push(`mov TOP ${register}`)
          this.lines.push(`mov @${register} ${register}`)
          this.lines.push(`mov ${this.offset(register, lexeme, argc)} ${register}`)
        }
      }
    }
  }

  translateArg() {

  }

  translatePass(curScope, params) {
    const v = params[0]
    this.lines.push(`push ${this.addr(curScope, v, 'TOP')}`)
  }

  translateBranch(curScope, params) {
    const v = params[0]
    const lb1 = params[1]
    this.lines.push(`jz ${lb1}`)
  }

  translateCall(curScope, params) {
    const func = params[0]
    this.lines.push(`push PC`)
    this.lines.push(`jump ${func}`)
  }

  translateSet(curScope, params) {
    const assignee = params[0]
    const op = params[2]
    const l = params[1]
    const r = params[3]



    if(op) {
      const a = this.addr(curScope, l, 'R0')
      const b = this.addr(curScope, r, 'R1')
      switch(op) {

        case "==": {

          this.lines.push(`cmp ${a} ${b}`)
          this.lines.push(`mov ZF ${this.addr(curScope, assignee, 'TOP')}`)
          break
        }
        case "||" : {
          this.lines.push(`mov ${a} R0`)
          this.lines.push(`or R0 ${b}`)
          this.lines.push(`mov R0 ${this.addr(curScope, assignee, 'TOP')}`)
          break
        }
        case '-' : {
          this.lines.push(`mov ${a} R0`)
          this.lines.push(`sub R0 ${b}`)
          this.lines.push(`mov R0 ${this.addr(curScope, assignee, 'TOP')}`)
          break
        }
        case '+': {
          this.lines.push(`mov ${a} R0`)
          this.lines.push(`add R0 ${b}`)
          this.lines.push(`mov R0 ${this.addr(curScope, assignee, 'TOP')}`)
        }
      }

    } else {
      const a = this.addr(curScope, assignee, 'R0')
      const b = this.addr(curScope, l, 'R1')
      this.lines.push(`mov ${b} ${a}`)
      if(assignee.indexOf('%') === -1) {
        this.lines.push(`sub #-4 SP`)
      }
    }
  }

  parse(sourceCode, symbols){
    this.lines = []
    this.symbolTable = new SymbolTable(symbols)
    const ilLines = sourceCode.split('\n')
    let sectionScope = null

    for(let iline of ilLines) {
      if(iline.trim()) {
        let label = ''
        if(iline.indexOf(':') !== -1) {
          [label, iline] = iline.split(':')
        }
        

        const prts = iline.split(' ').filter(x => x)
        const [codeName, ...params] = prts
        switch(codeName) {
          case 'section': {
            const [name, id] = params[0].split('@')
            sectionScope = this.symbolTable.findScope(id) 

            break
          }
          case 'set' : {
            this.translateSet(sectionScope, params)
            break
          }

          case 'branch' : {
            this.translateBranch(sectionScope, params)
            break
          }
          case 'pass' : {
            this.translatePass(sectionScope, params)
            break
          }

          case 'call' : {
            this.translateCall(sectionScope, params)
            break
          }
        }

      }
    }


  }

  print() {
    for(let line of this.lines) {
      console.log(line)
    }
  }
}

class SymbolTable {
  constructor(symbols, parent, level = 0) {
    if(level === 0) {
      this.hash = {}
    }
    this.parent = parent
    if(this.parent){
      this.hash = this.parent.hash
    }
    
    for(let key in symbols) {
      this[key] = symbols[key]
    }
    // this.id = symbols.id
    // this.table = symbols.table
    this.level = level 
    
   

    this.hash[this.id] = this
    for(let key in this.table) {
      this.table[key].level = this.level
      this.table[key].scopeId = this.id
    }

    this.children = symbols.children ? 
      symbols.children.map(x => new SymbolTable(x, this, level +1))
      : null
  }

  findScope(id){
    return this.hash[id]
  }

  find(id) {
    if(id.indexOf('@') !== -1) {
      const [vid,scopeId] = id.split('@')
      const scope = this.hash[scopeId]
      return scope.table[vid]
    } 
    else {
      if(this.table[id]) {
        return this.table[id]
      }
      return this.parent.find(id)
    }
  }


}

const sourceCode = `
section fibonacci@2
set %TOP% %SP%
set $t1@2 n == 1
set $t2@2 n == 2
set $t3@2 $t1@2 || $t2@2
branch $t3@2 LB1
return n@2
LB1:set $t4@2 n - 1
pass $t4@2
call fibonacci@1 $t5@2
set $t6@2 n - 2
pass $t6@2
call fibonacci@1 $t7@2
set $t8@2 $t5@2 + $t7@2
return $t8@2@2
section main@1
set %TOP% %SP%
declare function fibonacci@1
pass 5
call fibonacci@1 $t2@1
pass $t2@1
call print@1 $t3@1
`

const symbols = `{
  "id": 1,
  "table": {
    "print": {
      "type": "function",
      "index": 0
    },
    "fibonacci": {
      "type": "function",
      "index": 1
    },
    "$t2": {
      "type": "number",
      "index": 2
    },
    "$t3": {
      "type": "number",
      "index": 3
    }
  },
  "children": [
    {
      "id": 2,
      "table": {
        "n": {
          "type": "number",
          "index": 0
        },
        "$t1": {
          "type": "number",
          "index": 1
        },
        "$t2": {
          "type": "number",
          "index": 2
        },
        "$t3": {
          "type": "number",
          "index": 3
        },
        "$t4": {
          "type": "number",
          "index": 4
        },
        "$t5": {
          "type": "number",
          "index": 5
        },
        "$t6": {
          "type": "number",
          "index": 6
        },
        "$t7": {
          "type": "number",
          "index": 7
        },
        "$t8": {
          "type": "number",
          "index": 8
        }
      },
      "children": [
        {
          "id": 3,
          "table": {},
          "children": []
        }
      ],
      "type": "function",
      "argc": 1
    }
  ]
}`

const compiler = new OpcodeCompiler()
compiler.parse(sourceCode, JSON.parse(symbols))
compiler.print()