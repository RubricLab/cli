type TextVariant = 'normal' | 'gray' | 'inverse'
type ColorName = 'gray' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'

const colorCode: Record<ColorName, number> = {
	blue: 34,
	cyan: 36,
	gray: 90,
	green: 32,
	magenta: 35,
	red: 31,
	white: 37,
	yellow: 33
}

export function renderText({
	value,
	variant = 'normal',
	colorName,
	isUnderline = false
}: {
	value: string
	variant?: TextVariant
	colorName?: ColorName
	isUnderline?: boolean
}) {
	const codes: number[] = []
	if (variant === 'inverse') codes.push(7)
	if (isUnderline) codes.push(4)
	if (colorName) codes.push(colorCode[colorName])
	else if (variant === 'gray') codes.push(colorCode.gray)

	if (codes.length === 0) {
		process.stdout.write(value)
	} else {
		process.stdout.write(`\x1b[${codes.join(';')}m${value}\x1b[0m`)
	}
}
