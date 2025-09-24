import { clearLine, gray, hide, red, show } from './utils'

const green = (s: string) => `\x1b[32m${s}\x1b[0m`

export function createSpinner({
	label,
	intervalMilliseconds = 80,
	frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
}: {
	label: string
	intervalMilliseconds?: number
	frames?: string[]
}) {
	hide()
	let currentLabel = label
	let index = 0
	let stopped = false
	const tick = () => {
		if (stopped) return
		index = (index + 1) % frames.length
		const frame = frames[index] ?? ''
		clearLine(`${gray(frame)} ${currentLabel}`)
	}
	const timer = setInterval(tick, intervalMilliseconds)
	tick()

	const finish = (symbol: string, message?: string) => {
		if (stopped) return
		stopped = true
		clearInterval(timer)
		clearLine(`${symbol} ${message ?? currentLabel}\n`)
		show()
	}

	return {
		fail(message?: string) {
			finish(red('✖'), message)
		},
		stop(message?: string) {
			finish(gray('•'), message)
		}, // neutral stop
		succeed(message?: string) {
			finish(green('✔'), message)
		},
		update(nextLabel: string) {
			if (!stopped) {
				currentLabel = nextLabel
			}
		}
	}
}

export function createProgress({
	label,
	total,
	barWidth = 28
}: {
	label: string
	total: number
	barWidth?: number
}) {
	hide()
	let current = 0
	let currentLabel = label
	let finished = false

	const paint = () => {
		if (finished) return
		const ratio = total <= 0 ? 0 : Math.max(0, Math.min(1, current / total))
		const filled = Math.round(ratio * barWidth)
		const bar = `[${'#'.repeat(filled)}${'-'.repeat(barWidth - filled)}] ${Math.round(ratio * 100)}%`
		clearLine(`${bar} ${gray(currentLabel)}`)
	}
	paint()

	const finalize = (symbol: string, message?: string) => {
		if (finished) return
		finished = true
		clearLine(`${symbol} ${message ?? `${currentLabel} (${current}/${total})`}\n`)
		show()
	}

	return {
		fail(message?: string) {
			finalize(red('✖'), message)
		},
		setLabel(nextLabel: string) {
			currentLabel = nextLabel
			paint()
		},
		succeed(message?: string) {
			finalize(green('✔'), message)
		},
		update(nextCurrent: number) {
			current = nextCurrent
			paint()
		}
	}
}
