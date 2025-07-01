import { parseCommand } from './parse'
import type { CLI, Command } from './types'

export { format } from './colors'

import type { z } from 'zod/v4'
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
				argv,
				cliName: config.name,
				commands: config.commands,
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
}): Command<T> {
	return {
		args: config.args,
		description: config.description,
		handler: config.handler,
		name: config.name
	}
}
