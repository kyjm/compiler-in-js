function makeToken(type, value, lineno) {
	return { type, value, lineno }
}

class LexicalError extends Error {
	constructor(msg) {
		super(msg)
	}
}


const KEYWORDS = [
	'if',
  'else',
  'while',
  'for',
  'break',
  'continue',
  'function',
  'return',
	'auto'
]

module.exports = {
  makeToken,
  LexicalError,
  KEYWORDS
}