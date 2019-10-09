const {makeToken, LexicalError} = require('./util');
function op(sourceCode, index) {
  let state = 0;
  let op = '';

  while (true) {
    const c = sourceCode[index++];
    op += c;

    switch (state) {
      case 0: {
        switch (c) {
          case '+':
            state = 1;
            break;
          case '-':
            state = 2;
            break;
          case '*':
          case '/':
            return makeToken('op', op);

          case '=':
            state = 5;
            break;
          case '&':
            state = 6;
            break;
          case '|':
            state = 7;
            break;
          case '>':
            state = 8;
            break;
          case '<':
            state = 9;
            break;
          case '!':
            state = 10;
            break;
          case '(':
          case ')':
          case ';':
            return makeToken('op', op);
          default:
            throw new LexicalError('not an op');
        }
        break;
      }
      case 1: {
        if (c === '+') {
          return makeToken('op', '++');
        }
        return makeToken('op', '+');
      }
      case 2: {
        if (c === '-') {
          return makeToken('op', '--');
        }
        return makeToken('op', '-');
      }

      case 5: {
        if (c === '=') {
          return makeToken('op', '==');
        }
        return makeToken('op', '=');
      }
      case 6: {
        if (c === '&') {
          return makeToken('op', '&&');
        }
        return makeToken('op', '&');
      }
      case 7: {
        if (c === '|') {
          return makeToken('op', '||');
        }
        return makeToken('op', '|');
      }
      case 8: {
        if (c === '=') {
          return makeToken('op', '>=');
        }
        return makeToken('op', '>');
      }
      case 9: {
        if (c === '=') {
          return makeToken('op', '<=');
        }
        return makeToken('op', '<');
      }
      case 10: {
        if (c === '=') {
          return makeToken('op', '!=');
        }
        return makeToken('op', '!');
      }
      default:
        throw new LexicalError('not an op');
    }
  }
}

module.exports = op;
