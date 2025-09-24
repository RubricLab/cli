import { stdin as input, stdout as output } from 'node:process'

export type Key = { name?: string; ctrl?: boolean; sequence?: string }
export const gray = (s: string) => `\x1b[90m${s}\x1b[0m`
export const red = (s: string) => `\x1b[31m${s}\x1b[0m`
export const inv = (s: string) => `\x1b[7m${s}\x1b[0m`
export const clr = () => output.write('\x1b[2K\r')
export const up = (n: number) => n > 0 && output.write(`\x1b[${n}A`)
export const show = () => output.write('\x1B[?25h')
export const hide = () => output.write('\x1B[?25l')

export function cleanup() {
	input.setRawMode?.(false)
	show()
}
export function terminate(code = 0): never {
	cleanup()
	output.write('\n')
	process.exit(code)
}

export const clearLine = (s = '') => output.write(`\r\x1b[2K${s}`)
