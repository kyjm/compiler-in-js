function makeToken(type, value) {
	return { type, value }
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
	'auto'
]

module.exports = {
  makeToken,
  LexicalError,
  KEYWORDS
}