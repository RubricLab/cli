import { emitKeypressEvents } from 'node:readline'
import { z } from 'zod/v4'
import { cleanup, gray, hide, inv, type Key, terminate, up } from './utils'

export async function selectInput<const Options extends readonly [string, ...string[]]>({
	label,
	options,
	defaultValue
}: {
	label: string
	options: Options
	defaultValue: Options[number]
}): Promise<Options[number]> {
	emitKeypressEvents(process.stdin)
	process.stdin.setRawMode?.(true)
	hide()

	let i = Math.max(0, options.indexOf(defaultValue as string))
	const help = gray('↑/↓ move • Enter select • Esc cancel')
	const L = options.length + 2
	const line = (s: string) => `\x1b[2K\r${s}\n`

	const draw = (first = false) => {
		if (!first) up(L)
		process.stdout.write(
			line(label) +
				line(help) +
				options.map((o, j) => line(j === i ? inv(`> ${o}`) : `  ${o}`)).join('')
		)
	}

	draw(true)

	return await new Promise<Options[number]>(resolve => {
		const onKey = (_: string, k?: Key) => {
			if (!k) return
			if (k.ctrl && k.name === 'c') return terminate(130)
			if (k.name === 'escape') return terminate(0)
			if (k.name === 'down') {
				i = (i + 1) % options.length
				return draw()
			}
			if (k.name === 'up') {
				i = (i - 1 + options.length) % options.length
				return draw()
			}
			if (k.name === 'return') {
				const picked = options[i] as Options[number]
				process.stdin.off('keypress', onKey)
				cleanup()
				process.stdout.write(`${label}: ${picked}\n`)
				z.enum(options).parse(picked)
				return resolve(picked)
			}
		}
		process.stdin.on('keypress', onKey)
	})
}
