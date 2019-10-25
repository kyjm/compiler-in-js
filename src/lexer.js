const op = require('./lexical/op')
const literal = require('./lexical/literal')
const number = require('./lexical/number')
const { makeToken, LexicalError } = require('./lexical/util')

/**
 * 
 * @param {*} sourceCode 
 * @returns [Token] {type, value}
 */
function lexer(sourceCode) {

	const tokens = []
	let i = 0
	let lineno = 0

	function wrapper(automation_func){
		return (...args) => {

			const token = automation_func(...args)
			i += token.value.length
			token.lineno = lineno
			tokens.push(token)
		}
	}
	const getTokenLiteral = wrapper(literal)
	const getTokenNumber = wrapper(number)
	const getTokenOp = wrapper(op)

	while(i<sourceCode.length) {


		const c = sourceCode[i]
		if(c.match(/[A-Za-z]/)){
			getTokenLiteral(sourceCode, i)
		}else if(c.match(/[0-9.]/)){
			getTokenNumber(sourceCode, i)
		}
		else if(c.match(/[+-\\*/&|=!;()]/)) {			
			getTokenOp(sourceCode, i)
		}
		else if(c === '{' || c === '}'){
			i++
			tokens.push( makeToken('block', c, lineno) )
			
		}
		else if(c === '\n' || c === '\r') {

			i++
			lineno ++
			continue
		}
		else if(c === ' ' || c === '\t') {
			i++
			continue
		}
		else {
			throw new LexicalError(`lexical error:unexpected char ${c} in line ${lineno} `)
		}
	}
	return tokens
}

module.exports = lexer