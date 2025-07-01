import { z } from 'zod/v4'
import { format } from './colors'
import { showHelp } from './help'
import type { Command } from './types'
import { kebabToCamel } from './utils'

export async function parseCommand({
	commands,
	argv = process.argv.slice(2),
	cliName,
	version
}: {
	commands: Command[]
	argv?: string[]
	cliName: string
	version: string
}): Promise<void> {
	if (argv.length === 0) {
		showHelp({ cliName, commands })
		return
	}

	if (argv[0] === '--help' || argv[0] === '-h') {
		showHelp({ cliName, command: argv[1] || '', commands })
		return
	}

	if (argv[0] === '--version' || argv[0] === '-v') {
		console.log(`${cliName} v${version}`)
		return
	}

	const commandName = argv[0]
	const command = commands.find(c => c.name === commandName)

	if (!command) {
		console.error(format.error(`Unknown command: ${commandName}`))
		showHelp({ cliName, commands })
		process.exit(1)
	}

	const args = parseArgs({
		argv: argv.slice(1),
		schema: command.args
	})

	try {
		await command.handler(args)
	} catch (error) {
		if (error instanceof Error) {
			console.error(format.error(`Error: ${error.message}`))
		} else {
			console.error(format.error('An unknown error occurred'))
		}
		process.exit(1)
	}
}

const FLAG_REGEX = /^--([a-zA-Z0-9-_]+)$/
const SHORT_FLAG_REGEX = /^-([a-zA-Z0-9-_])$/

export function parseArgs<T extends z.ZodType>({
	argv,
	schema
}: {
	argv: string[]
	schema: T
}): z.infer<T> {
	const args: Record<string, unknown> = {}

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i] || ''
		const nextArg = argv[i + 1]
		const nextIsValue = nextArg && !nextArg.startsWith('-')

		const flagMatch = arg.match(FLAG_REGEX)
		const shortMatch = arg.match(SHORT_FLAG_REGEX)

		let flagName = ''

		if (shortMatch) {
			const flags = (shortMatch[1] || '').split('')
			for (const flag of flags) {
				if (schema instanceof z.ZodObject) {
					const { shape } = schema
					const keys = Object.keys(shape)
					const matchingKey = keys.find(k => k.toLowerCase().startsWith(flag.toLowerCase()))
					flagName = matchingKey || ''
				}
			}
		}

		if (flagMatch) flagName = kebabToCamel(flagMatch[1] || '')

		// TODO: map between Zod types in a flat, extensible way
		if (schema instanceof z.ZodObject) {
			const { shape } = schema
			let field = shape[flagName]
			if (field) {
				if (field instanceof z.ZodOptional) field = field.unwrap()
				if (field instanceof z.ZodDefault) field = field.unwrap()

				if (field instanceof z.ZodBoolean) {
					args[flagName] = true
					continue
				}

				if (field instanceof z.ZodNumber) {
					args[flagName] = Number(nextArg)
					i++ // Skip the next arg
					continue
				}
			}
		}

		if (nextIsValue) {
			args[flagName] = nextArg
			i++ // Skip the next arg
		} else {
			throw new Error(`Missing value for flag --${flagName}`)
		}
	}

	const { data, success, error } = schema.safeParse(args)

	if (!success) {
		console.error(format.error(error.message))
		throw error
	}

	return data
}
