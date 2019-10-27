class ILGen {

  static labelCounter = 1

  constructor(){
    this.stack = [] 
    this.sections = []    
  }

  beginSection(mark){
    const section = new Section(mark)
    this.sections.push(section)
    this.stack.push(section)
  }

  genLabel(){
    return `LB${ILGen.labelCounter++}`
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

  currentLine(){
    const section = this.current()
    return section.lines[section.lines.length-1]

  }

  bindLabel(index, label) {
    const section = this.current()
    section.bindLabel(index, label)
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
      const section =  this.sections[i]
      text += 'section ' + section.mark + '\n'
      for(let line of section.lines) {
        if(section.labels[line.lineno]) {
          text += section.labels[line.lineno]+":" + line.code + '\n'
        } else {
          text += line.code + '\n'
        }
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
    this.labels = []
  }

  bindLabel(index, label) {
    this.labels[index] = label

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



