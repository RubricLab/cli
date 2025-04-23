import { parseCommand } from './parse'
import type { CLI, Command } from './types'
export { format } from './colors'
import type { z } from 'zod'
export type { Command, CLI }

export function createCLI(config: {
	name: string
	version: string
	description: string
	commands: Command[]
}): CLI {
	return {
		commands: config.commands,
		parse: async (argv = process.argv.slice(2)) => {
			await parseCommand({
				commands: config.commands,
				argv,
				cliName: config.name,
				version: config.version
			})
		}
	}
}

export function createCommand<T extends z.ZodSchema>(config: {
	name: string
	description: string
	args: T
	handler: (args: z.infer<T>) => void | Promise<void>
}): Command {
	return {
		name: config.name,
		description: config.description,
		args: config.args,
		handler: config.handler
	}
}
