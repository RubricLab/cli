const GLYPH_COLUMNS = 3
const GLYPH_ROWS = 5
const PIXEL = '█'

const FONT: Record<string, readonly string[]> = {
	' ': ['000', '000', '000', '000', '000'],
	'-': ['000', '000', '111', '000', '000'],
	'!': ['010', '010', '010', '000', '010'],
	'?': ['111', '001', '011', '000', '010'],
	'0': ['111', '101', '101', '101', '111'],
	'1': ['010', '110', '010', '010', '111'],
	'2': ['111', '001', '111', '100', '111'],
	'3': ['111', '001', '111', '001', '111'],
	'4': ['101', '101', '111', '001', '001'],
	'5': ['111', '100', '111', '001', '111'],
	'6': ['111', '100', '111', '101', '111'],
	'7': ['111', '001', '010', '010', '010'],
	'8': ['111', '101', '111', '101', '111'],
	'9': ['111', '101', '111', '001', '111'],
	A: ['010', '101', '111', '101', '101'],
	B: ['110', '101', '110', '101', '110'],
	C: ['011', '100', '100', '100', '011'],
	D: ['110', '101', '101', '101', '110'],
	E: ['111', '100', '110', '100', '111'],
	F: ['111', '100', '110', '100', '100'],
	G: ['011', '100', '101', '101', '011'],
	H: ['101', '101', '111', '101', '101'],
	I: ['111', '010', '010', '010', '111'],
	J: ['001', '001', '001', '101', '010'],
	K: ['101', '110', '100', '110', '101'],
	L: ['100', '100', '100', '100', '111'],
	M: ['111', '111', '101', '101', '101'],
	N: ['101', '111', '111', '111', '101'],
	O: ['010', '101', '101', '101', '010'],
	P: ['110', '101', '110', '100', '100'],
	Q: ['010', '101', '101', '111', '011'],
	R: ['110', '101', '110', '110', '101'],
	S: ['011', '100', '010', '001', '110'],
	T: ['111', '010', '010', '010', '010'],
	U: ['101', '101', '101', '101', '111'],
	V: ['101', '101', '101', '010', '010'],
	W: ['101', '101', '101', '111', '111'],
	X: ['101', '010', '010', '010', '101'],
	Y: ['101', '101', '010', '010', '010'],
	Z: ['111', '001', '010', '100', '111']
} as const

function renderBlock(text: string): string[] {
	const rows = Array.from({ length: GLYPH_ROWS }, () => '')
	for (const ch of text.toUpperCase()) {
		const glyph = FONT[ch] ?? FONT['?']
		for (let r = 0; r < GLYPH_ROWS; r++)
			rows[r] += `${glyph[r].replace(/1/g, PIXEL).replace(/0/g, ' ')} `
	}
	return rows.map(r => r.trimEnd())
}

function widthOf(text: string): number {
	const perChar = GLYPH_COLUMNS + 1 // 3 pixels + 1 space
	return Math.max(0, text.length * perChar - 1)
}

function wrapByWords(text: string, maxWidth: number): string[] {
	const words = text.trim().split(/\s+/)
	const lines: string[] = []
	const perChar = GLYPH_COLUMNS + 1
	const spaceChars = 1

	let currentChars = 0
	let currentWords: string[] = []

	for (const word of words) {
		const nextChars = (currentWords.length ? spaceChars : 0) + word.length
		const nextWidth = (currentChars + nextChars) * perChar - 1
		if (currentWords.length && nextWidth > maxWidth) {
			lines.push(currentWords.join(' '))
			currentWords = [word]
			currentChars = word.length
		} else {
			currentWords.push(word)
			currentChars += nextChars
		}
	}
	if (currentWords.length) lines.push(currentWords.join(' '))
	return lines
}

export function heading(text: string): void {
	const columns = process.stdout.columns ?? 80

	const words = text.trim().split(/\s+/)
	if (Math.max(...words.map(w => widthOf(w))) > columns) {
		process.stdout.write(`\n${text}\n\n`)
		return
	}

	const lines = wrapByWords(text, columns)

	process.stdout.write('\n')
	lines.forEach((line, index) => {
		const block = renderBlock(line)
		process.stdout.write(`${block.join('\n')}\n`)
		if (index < lines.length - 1) {
			const w = Math.min(widthOf(line), columns)
			process.stdout.write(`${'─'.repeat(w)}\n`)
		}
	})
	process.stdout.write('\n')
}