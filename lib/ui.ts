import { stdin as input, stdout as output } from 'node:process'
import { emitKeypressEvents } from 'node:readline'
import { type ZodTypeAny, z } from 'zod/v4'

type Key = { name?: string; ctrl?: boolean; sequence?: string }
const gray = (s: string) => `\x1b[90m${s}\x1b[0m`
const red = (s: string) => `\x1b[31m${s}\x1b[0m`
const erase = (n: number) => output.write(`\x1b[${n}D${' '.repeat(n)}\x1b[${n}D`)

let onKeyRef: ((s: string, k?: Key) => void) | null = null
function cleanup() {
	if (onKeyRef) {
		input.off('keypress', onKeyRef)
		onKeyRef = null
	}
	input.setRawMode?.(false)
}
export function terminate(code = 0): never {
	cleanup()
	output.write('\n')
	process.exit(code)
}

async function prompt(label: string, placeholder: string): Promise<string> {
	output.write(`${label}: `)
	if (placeholder) output.write(gray(placeholder))
	let buf = ''
	let cleared = placeholder.length === 0
	emitKeypressEvents(input)
	input.setRawMode?.(true)

	return await new Promise<string>(resolve => {
		const done = (v: string) => {
			output.write('\n')
			cleanup()
			resolve(v)
		}
		const onKey = (_: string, k?: Key) => {
			if (!k) return
			if ((k.ctrl && k.name === 'c') || k.name === 'escape') terminate(k.name === 'escape' ? 0 : 130)
			if (k.name === 'return') return done(buf || placeholder)
			if (k.name === 'backspace') {
				if (!cleared && placeholder) {
					erase(placeholder.length)
					cleared = true
				}
				if (buf) {
					buf = buf.slice(0, -1)
					output.write('\b \b')
				}
				return
			}
			const ch = k.sequence ?? ''
			if (ch.length === 1 && ch >= ' ') {
				if (!cleared && placeholder) {
					erase(placeholder.length)
					cleared = true
				}
				buf += ch
				output.write(ch)
			}
		}
		onKeyRef = onKey
		input.on('keypress', onKey)
	})
}

async function ask<T extends ZodTypeAny>(
	label: string,
	def: string,
	schema: T
): Promise<z.infer<T>> {
	for (;;) {
		const raw = await prompt(label, def)
		const r = schema.safeParse(raw)
		if (r.success) return r.data as z.infer<T>
		output.write(red(`✖ ${r.error.issues[0]?.message}\n`))
	}
}

// ---------- existing inputs ----------
export async function textInput(label: string, defaultValue: string): Promise<string> {
	return ask(label, defaultValue, z.string())
}
export async function numberInput(label: string, defaultValue: number): Promise<number> {
	return ask(
		label,
		String(defaultValue),
		z.coerce.number().refine(Number.isFinite, 'Enter a valid number')
	)
}
export async function booleanInput(label: string, defaultValue: boolean): Promise<boolean> {
	const hint = `${label} ${defaultValue ? '[Y/n]' : '[y/N]'}`
	return ask(
		hint,
		defaultValue ? 'Y' : 'N',
		z
			.string()
			.transform(s => s.trim().toLowerCase())
			.refine(s => ['', 'y', 'yes', 'true', '1', 'n', 'no', 'false', '0'].includes(s), 'Enter y/n')
			.transform(s => (s === '' ? defaultValue : ['y', 'yes', 'true', '1'].includes(s)))
	)
}

export async function selectInput<const Options extends readonly [string, ...string[]]>(
	label: string,
	options: Options,
	defaultValue: Options[number]
): Promise<Options[number]> {
	const item = z.union([
		z.coerce
			.number()
			.int()
			.min(1)
			.max(options.length)
			.transform(i => options[i - 1] as Options[number]),
		z.enum(options)
	])
	const hint = `${label} ${options.map((o, i) => `[${i + 1}:${o}]`).join(' ')}`
	return ask(hint, String(defaultValue), item)
}

export async function multiSelectInput<const Options extends readonly [string, ...string[]]>(
	label: string,
	options: Options,
	defaultValues: readonly Options[number][]
): Promise<Options[number][]> {
	const toArray = z
		.string()
		.transform(s => s.trim())
		.transform(s =>
			s === ''
				? []
				: s
						.split(/[,\s]+/)
						.map(t => t.trim())
						.filter(Boolean)
		)
		.transform(tokens =>
			tokens.map(t => {
				const n = Number(t)
				return Number.isInteger(n) && n >= 1 && n <= options.length
					? (options[n - 1] as Options[number])
					: (t as Options[number])
			})
		)
	const arr = toArray
		.pipe(z.array(z.enum(options)).nonempty('Pick at least one'))
		.transform(a => Array.from(new Set(a))) // dedupe deterministically

	const hint = `${label} (comma/space) ${options.map((o, i) => `[${i + 1}:${o}]`).join(' ')}`
	return ask(hint, defaultValues.join(','), arr)
}

const _name = await textInput('Name', 'John Doe')
const _age = await numberInput('Age', 30)
const _subscribe = await booleanInput('Subscribe to newsletter', true)

const _color = await selectInput('Color', ['red', 'green', 'blue'] as const, 'green')
const _toppings = await multiSelectInput(
	'Toppings',
	['onion', 'olive', 'mushroom', 'pepper'] as const,
	['olive']
)

console.log({ _age, _color, _name, _subscribe, _toppings })

terminate()
