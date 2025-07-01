import { z } from 'zod/v4'
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
			showHelp({ cliName, commands })
			return
		}
		showCommandHelp({ cliName, command: cmd })
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

function showCommandHelp({ command, cliName }: { command: Command; cliName: string }): void {
	console.log(`\n${format.title('USAGE')}`)
	console.log(`  ${cliName} ${command.name} [options]`)

	console.log(`\n${format.title('DESCRIPTION')}`)
	console.log(`  ${command.description}`)

	if (command.args instanceof z.ZodObject) {
		const shape = command.args.shape as z.ZodObject
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

type SupportedZodType =
	| z.ZodBoolean
	| z.ZodString
	| z.ZodNumber
	| z.ZodArray
	| z.ZodOptional
	| z.ZodDefault

function getSchemaType(schema: SupportedZodType): string {
	if (schema instanceof z.ZodBoolean) return 'boolean'
	if (schema instanceof z.ZodString) return 'string'
	if (schema instanceof z.ZodNumber) return 'number'
	if (schema instanceof z.ZodArray) return 'array'
	if (schema instanceof z.ZodOptional) return getSchemaType(schema.def.innerType as SupportedZodType)
	if (schema instanceof z.ZodDefault) return getSchemaType(schema.def.innerType as SupportedZodType)
	return 'value'
}

function getSchemaDescription(schema: SupportedZodType): string | undefined {
	if (schema instanceof z.ZodOptional)
		return getSchemaDescription(schema.def.innerType as SupportedZodType)
	if (schema instanceof z.ZodDefault)
		return getSchemaDescription(schema.def.innerType as SupportedZodType)
	return schema.description
}

function getSchemaDefaultValue(schema: SupportedZodType): unknown {
	if (schema instanceof z.ZodDefault) {
		const defaultValue = schema.def.defaultValue
		return defaultValue
	}
	if (schema instanceof z.ZodOptional)
		return getSchemaDefaultValue(schema.def.innerType as SupportedZodType)
	return undefined
}
