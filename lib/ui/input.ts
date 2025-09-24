import { emitKeypressEvents } from 'node:readline'
import { type ZodType, z } from 'zod/v4'
import { cleanup, clearLine, gray, type Key, red, terminate } from './utils'

async function readLine({
	label,
	placeholder = '',
	isMasked = false
}: {
	label: string
	placeholder?: string
	isMasked?: boolean
}): Promise<string> {
	emitKeypressEvents(process.stdin)
	process.stdin.setRawMode?.(true)

	const prefix = `${label}: `
	const placeholderView = placeholder
		? gray(isMasked ? '•'.repeat(placeholder.length) : placeholder)
		: ''

	clearLine(prefix + placeholderView)

	let buffer = ''

	return await new Promise<string>(resolve => {
		const paint = () =>
			clearLine(prefix + (buffer ? (isMasked ? '•'.repeat(buffer.length) : buffer) : placeholderView))
		const finish = (value: string) => {
			process.stdout.write('\n')
			process.stdin.off('keypress', onKey)
			cleanup()
			resolve(value)
		}
		const onKey = (_: string, key?: Key) => {
			if (!key) return
			if ((key.ctrl && key.name === 'c') || key.name === 'escape')
				return terminate(key.name === 'escape' ? 0 : 130)
			if (key.name === 'return') return finish(buffer)
			if (key.name === 'backspace') {
				if (buffer) buffer = buffer.slice(0, -1)
				return paint()
			}
			const ch = key.sequence ?? ''
			if (ch.length === 1 && ch >= ' ') {
				buffer += ch
				paint()
			}
		}
		process.stdin.on('keypress', onKey)
	})
}

async function ask<T>({
	label,
	defaultValue,
	schema,
	isMasked = false,
	placeholder
}: {
	label: string
	defaultValue: string
	schema: ZodType<T>
	isMasked?: boolean
	placeholder?: string
}): Promise<T> {
	for (;;) {
		const raw = await readLine({ isMasked, label, placeholder: placeholder ?? defaultValue })
		const candidate = raw === '' ? defaultValue : raw
		const parsed = schema.safeParse(candidate)
		if (parsed.success) return parsed.data
		process.stdout.write(red(`✖ ${parsed.error.issues[0]?.message}\n`))
	}
}

export async function textInput({
	label,
	defaultValue,
	schema = z.string(),
	isMasked = false,
	placeholder
}: {
	label: string
	defaultValue: string
	schema?: ZodType<string>
	isMasked?: boolean
	placeholder?: string
}): Promise<string> {
	return ask({ defaultValue, isMasked, label, placeholder, schema })
}

export async function passwordInput({
	label,
	defaultValue,
	schema = z.string(),
	isMasked = true,
	placeholder
}: {
	label: string
	defaultValue: string
	schema?: ZodType<string>
	isMasked?: boolean
	placeholder?: string
}): Promise<string> {
	return ask({
		defaultValue,
		isMasked,
		label,
		placeholder: placeholder ?? defaultValue,
		schema
	})
}

export async function numberInput({
	label,
	defaultValue,
	schema = z.coerce.number().refine(Number.isFinite, 'Enter a valid number'),
	isMasked = false,
	placeholder
}: {
	label: string
	defaultValue: number
	schema?: ZodType<number>
	isMasked?: boolean
	placeholder?: string
}): Promise<number> {
	return ask({ defaultValue: String(defaultValue), isMasked, label, placeholder, schema })
}

export async function booleanInput({
	label,
	defaultValue,
	schema = z
		.string()
		.transform(s => s.trim().toLowerCase())
		.refine(s => ['', 'y', 'yes', 'true', '1', 'n', 'no', 'false', '0'].includes(s), 'Enter y or n')
		.transform(s => (s === '' ? defaultValue : ['y', 'yes', 'true', '1'].includes(s))),
	isMasked = false
}: {
	label: string
	defaultValue: boolean
	schema?: ZodType<boolean>
	isMasked?: boolean
}): Promise<boolean> {
	const labelWithHint = `${label} ${defaultValue ? '[Y/n]' : '[y/N]'}`
	const placeholder = defaultValue ? 'Y' : 'N'
	return ask({
		defaultValue: defaultValue ? 'y' : 'n',
		isMasked,
		label: labelWithHint,
		placeholder,
		schema
	})
}
