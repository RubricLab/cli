import { z } from 'zod'
import { format } from './colors'
import { showHelp } from './help'
import type { Command } from './types'

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
		showHelp({ commands, cliName })
		return
	}

	if (argv[0] === '--help' || argv[0] === '-h') {
		showHelp({ commands, cliName, command: argv[1] })
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
		showHelp({ commands, cliName })
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

function parseArgs<T extends z.ZodType>({
	argv,
	schema
}: {
	argv: string[]
	schema: T
}): z.infer<T> {
	const args: Record<string, unknown> = {}
	const flagRegex = /^--([a-zA-Z0-9-_]+)$/
	const shortFlagRegex = /^-([a-zA-Z0-9-_]+)$/

	const kebabToCamel = (str: string): string =>
		str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]

		const flagMatch = arg.match(flagRegex)
		if (flagMatch) {
			const flagName = kebabToCamel(flagMatch[1])

			const nextArg = argv[i + 1]
			const nextIsValue = nextArg && !nextArg.startsWith('-')

			let isBoolean = false
			if (schema instanceof z.ZodObject) {
				const shape = schema.shape
				const field = shape[flagName]
				if (field) {
					if (field instanceof z.ZodBoolean) {
						isBoolean = true
					} else if (field instanceof z.ZodOptional && field.unwrap() instanceof z.ZodBoolean) {
						isBoolean = true
					}
				}
			}

			if (isBoolean) {
				args[flagName] = true
			} else if (nextIsValue) {
				args[flagName] = nextArg
				i++ // Skip the next arg
			} else {
				throw new Error(`Missing value for flag --${flagMatch[1]}`)
			}
			continue
		}

		const shortMatch = arg.match(shortFlagRegex)
		if (shortMatch) {
			const flags = shortMatch[1].split('')
			for (const flag of flags) {
				if (schema instanceof z.ZodObject) {
					const shape = schema.shape
					const keys = Object.keys(shape)
					const matchingKey = keys.find(k => k.toLowerCase().startsWith(flag.toLowerCase()))

					if (matchingKey) {
						args[matchingKey] = true
					}
				}
			}
		}
	}

	const { success, error } = schema.safeParse(args)

	if (!success) {
		console.error(format.error(error.message))
		process.exit(0)
	}

	return success
}
