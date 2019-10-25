class ILGen {

  constructor(){
    this.stack = [] 
    this.sections = []
  }

  beginSection(mark){
    const section = new Section(mark)
    this.sections.push(section)
    this.stack.push(section)
  }

  endSection(){
    this.stack.pop()
  }

  add(code){
    return this.current().add(code)
  }

  current(){
    return this.stack[this.stack.length - 1]
  }

  print(){

    for(let i = this.sections.length-1; i>=0; i--){
      const section = this.sections[i]
      console.log('section:' + section.mark)
      for(let line of section.lines) {
        console.log(`${line.lineno}:${line.code}`)
      }
    }
  }

  toText(){
    let text = ''
    for(let i = this.sections.length-1; i>=0; i--){
      const section = this.sections[i]
      text += section.mark + '\n'
      for(let line of section.lines) {
        text += line.code + '\n'
      }
    } 
    return text
  }

}

class Section{
  constructor(mark){
    this.mark = mark 
    this.lines = []
    this.lineno = 0
  }

  add(code){
    const line = {
      code,
      lineno : this.lineno++
    }
    this.lines.push(line)
    return line
  }
}

module.exports = ILGen



