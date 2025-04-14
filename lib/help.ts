import { z } from 'zod'
import { format } from './colors'
import type { Command } from './types'

export function showHelp({
	commands,
	cliName,
	command
}: {
	commands: Command[]
	cliName: string
	command?: string
}): void {
	if (command) {
		const cmd = commands.find(c => c.name === command)
		if (!cmd) {
			console.error(format.error(`Unknown command: ${command}`))
			showHelp({ commands, cliName })
			return
		}
		showCommandHelp({ command: cmd, cliName })
		return
	}

	console.log(`\n${format.title('USAGE')}`)
	console.log(`  ${cliName} [command] [options]`)

	console.log(`\n${format.title('COMMANDS')}`)
	for (const cmd of commands) {
		console.log(`  ${format.command(cmd.name)}`)
		console.log(`    ${cmd.description}`)
	}

	console.log(`\n${format.title('OPTIONS')}`)
	console.log(`  ${format.parameter('--help, -h')}`)
	console.log('    Show help information')
	console.log(`  ${format.parameter('--version, -v')}`)
	console.log('    Show version information')
}

function showCommandHelp({
	command,
	cliName
}: {
	command: Command
	cliName: string
}): void {
	console.log(`\n${format.title('USAGE')}`)
	console.log(`  ${cliName} ${command.name} [options]`)

	console.log(`\n${format.title('DESCRIPTION')}`)
	console.log(`  ${command.description}`)

	if (command.args instanceof z.ZodObject) {
		const shape = command.args.shape as z.AnyZodObject
		const entries = Object.entries(shape)

		if (entries.length > 0) {
			console.log(`\n${format.title('OPTIONS')}`)

			for (const [key, schema] of entries) {
				const type = getSchemaType(schema)
				const isRequired = schema.isOptional()
				const description = getSchemaDescription(schema)
				const defaultValue = getSchemaDefaultValue(schema)

				const flagStr = type === 'boolean' ? `--${key}` : `--${key} <${type}>`

				const requiredStr = isRequired ? ' (required)' : ''
				const defaultStr = defaultValue !== undefined ? ` (default: ${defaultValue})` : ''

				console.log(`  ${format.parameter(flagStr)}${requiredStr}${defaultStr}`)
				if (description) {
					console.log(`    ${description}`)
				}
				console.log('')
			}
		}
	}
}

function getSchemaType(schema: z.ZodTypeAny): string {
	if (schema instanceof z.ZodBoolean) return 'boolean'
	if (schema instanceof z.ZodString) return 'string'
	if (schema instanceof z.ZodNumber) return 'number'
	if (schema instanceof z.ZodArray) return 'array'
	if (schema instanceof z.ZodOptional) return getSchemaType(schema.unwrap())
	if (schema instanceof z.ZodDefault) return getSchemaType(schema.removeDefault())
	return 'value'
}

function getSchemaDescription(schema: z.ZodTypeAny): string | undefined {
	if (schema instanceof z.ZodOptional) return getSchemaDescription(schema.unwrap())
	if (schema instanceof z.ZodDefault) return getSchemaDescription(schema.removeDefault())
	return schema.description
}

function getSchemaDefaultValue(schema: z.ZodTypeAny): unknown {
	if (schema instanceof z.ZodDefault) {
		const defaultValue = schema._def.defaultValue()
		return defaultValue
	}
	if (schema instanceof z.ZodOptional) return getSchemaDefaultValue(schema.unwrap())
	return undefined
}
