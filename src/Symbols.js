class Symbols {

  constructor(){
    this.var_id = 1
  }

  assign_temp_var () {
    return 't' + this.var_id++
  }

}

module.exports = Symbols