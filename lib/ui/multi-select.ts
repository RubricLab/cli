import { emitKeypressEvents } from 'node:readline'
import { z } from 'zod/v4'
import { cleanup, gray, hide, inv, type Key, terminate, up } from './utils'

export async function multiSelectInput<const Options extends readonly [string, ...string[]]>({
	label,
	options,
	defaultValues
}: {
	label: string
	options: Options
	defaultValues: readonly Options[number][]
}): Promise<Options[number][]> {
	emitKeypressEvents(process.stdin)
	process.stdin.setRawMode?.(true)
	hide()
	let i = 0
	const sel = new Set<Options[number]>(defaultValues as Options[number][])
	const help = gray('↑/↓ move • Space toggle • Enter confirm • Esc cancel')
	const L = options.length + 2
	const line = (s: string) => `\x1b[2K\r${s}\n`
	const draw = (first = false) => {
		if (!first) up(L)
		process.stdout.write(
			line(label) +
				line(help) +
				options
					.map((o, j) => {
						const mark = sel.has(o as Options[number]) ? '[x]' : '[ ]'
						const row = `${mark} ${o}`
						return line(j === i ? inv(`> ${row}`) : `  ${row}`)
					})
					.join('')
		)
	}
	draw(true)

	return await new Promise<Options[number][]>(resolve => {
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
			if (k.name === 'space') {
				const v = options[i] as Options[number]
				sel.has(v) ? sel.delete(v) : sel.add(v)
				return draw()
			}
			if (k.name === 'return') {
				if (sel.size === 0) {
					process.stdout.write('\x07')
					return
				}
				const picked = options.filter(o => sel.has(o as Options[number])) as Options[number][]
				process.stdin.off('keypress', onKey)
				cleanup()
				process.stdout.write(`${label}: ${picked.join(', ')}\n`)
				z.array(z.enum(options)).nonempty().parse(picked)
				return resolve(picked)
			}
		}
		process.stdin.on('keypress', onKey)
	})
}
