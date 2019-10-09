const {makeToken, LexicalError, KEYWORDS} = require('./util');
/* 处理一个部分的子自动机都是一个函数 */
/* (souceCode, index) => Token ({type, value}) */
/*   throws LexicalError */

/*
 * 词语类型
 */
function literal(sourceCode, index) {
  let state = 0;
  let str = '';

  function getNextChar() {
    return sourceCode[index++];
  }

  while (true) {
    switch (state) {
      case 0: {
        const c = getNextChar();
        if (c.match(/[A-Za-z]/)) {
          str += c;
          state = 1;
        } else {
          throw new LexicalError('not a illegal operator');
        }
        break;
      }
      case 1: {
        const c = getNextChar();
        if (c.match(/[A-Za-z0-9]/)) {
          str += c;
        } else {
          if (KEYWORDS.includes(str)) {
            return makeToken('keyword', str);
          } else {
            return makeToken('id', str);
          }
        }
        break;
      }
    }
  }
}

module.exports = literal;
